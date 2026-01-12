import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { assignRole, logToChannel } from '@/lib/discord';
import { Resend } from 'resend';

// Initializing Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const signature = req.headers.get('x-signature-ed25519');
        const timestamp = req.headers.get('x-signature-timestamp');
        const body = await req.text();
        const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();

        console.log('[Discord Debug] Interaction Request Received');
        console.log('[Discord Debug] Headers:', { signature: !!signature, timestamp: !!timestamp });
        console.log('[Discord Debug] Body Length:', body.length);
        console.log('[Discord Debug] Public Key Check:', publicKey ? publicKey.substring(0, 5) + '...' : 'MISSING');

        if (!signature || !timestamp || !publicKey) {
            console.error('[Discord Debug] Verification failed: Missing headers or Public Key');
            return new Response('Bad request signature', { status: 401 });
        }

        // 1. Verify Request Source (Security)
        let isValidRequest = false;
        try {
            isValidRequest = await verifyKey(body, signature, timestamp, publicKey);
        } catch (err) {
            console.error('[Discord Debug] verifyKey exception:', err.message);
        }

        console.log('[Discord Debug] Verification Result:', isValidRequest);

        if (!isValidRequest) {
            return new Response('Bad request signature', { status: 401 });
        }

        const interaction = JSON.parse(body);
        console.log('[Discord Debug] Interaction Type:', interaction.type);

        // 2. Handle Handshake (required by Discord)
        if (interaction.type === InteractionType.PING) {
            console.log('[Discord] PING received, sending PONG');
            return NextResponse.json({ type: InteractionResponseType.PONG });
        }

        // 3. Handle Slash Commands
        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const { name, options } = interaction.data;
            const discordUserId = interaction.member?.user?.id || interaction.user?.id;

            if (!discordUserId) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: '❌ Could not determine your User ID.', flags: 64 },
                });
            }

            // --- CASE: /verify [email] ---
            if (name === 'verify') {
                const emailOption = options.find((o) => o.name === 'email');
                const email = emailOption?.value;

                if (!email || !email.toLowerCase().endsWith('@brown.edu')) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ Only @brown.edu emails are allowed.', flags: 64 },
                    });
                }

                const emailHash = hashEmail(email);

                // Check if already verified
                const { data: existing } = await supabase
                    .from('verifications')
                    .select('id')
                    .eq('email_hash', emailHash)
                    .single();

                if (existing) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ This email has already been used to verify a user.', flags: 64 },
                    });
                }

                // Generate Code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

                const { error: dbError } = await supabase
                    .from('pending_codes')
                    .upsert({
                        discord_id: discordUserId,
                        code,
                        email_hash: emailHash,
                        expires_at: expiresAt.toISOString(),
                    }, { onConflict: 'discord_id' });

                if (dbError) {
                    console.error('[Error] Supabase Error:', dbError);
                    throw dbError;
                }

                // Send Email via Resend
                if (!process.env.RESEND_API_KEY) {
                    console.error('[Error] Missing RESEND_API_KEY');
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ Email service is not configured on the server.', flags: 64 },
                    });
                }

                try {
                    const { data, error: resendError } = await resend.emails.send({
                        from: 'Verification Bot <onboarding@resend.dev>',
                        to: email,
                        subject: 'Your Discord Verification Code',
                        html: `
                          <div style="font-family: sans-serif; padding: 20px;">
                            <h2 style="color: #ef4444;">Brown University Verification</h2>
                            <p>Your verification code is:</p>
                            <div style="background: #f4f4f4; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px;">
                              ${code}
                            </div>
                            <p>Type <strong>/confirm code: ${code}</strong> in Discord to verify.</p>
                          </div>
                        `,
                    });

                    if (resendError) {
                        console.error('[Resend Error]:', resendError);
                        return NextResponse.json({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content: `❌ Email failed to send. Note: Resend Free Tier only allows sending to your own email address. (Error: ${resendError.message})`,
                                flags: 64
                            },
                        });
                    }
                } catch (emailErr) {
                    console.error('[Error] Email sending failed Exception:', emailErr);
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ Failed to send verification email. Please try again later.', flags: 64 },
                    });
                }

                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: '📬 A verification code has been sent to your email! Once received, type `/confirm code: [your-code]`.', flags: 64 },
                });
            }

            // --- CASE: /confirm [code] ---
            if (name === 'confirm') {
                const codeOption = options.find((o) => o.name === 'code');
                const code = codeOption?.value;

                const { data: pending, error: fetchError } = await supabase
                    .from('pending_codes')
                    .select('*')
                    .eq('discord_id', discordUserId)
                    .eq('code', code)
                    .single();

                if (fetchError || !pending) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ Invalid or expired code.', flags: 64 },
                    });
                }

                if (new Date(pending.expires_at) < new Date()) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ This code has expired. Please run /verify again.', flags: 64 },
                    });
                }

                // Assign Role & Log
                try {
                    await assignRole(discordUserId);

                    await supabase.from('verifications').insert({
                        discord_id: discordUserId,
                        email_hash: pending.email_hash,
                    });

                    await supabase.from('pending_codes').delete().eq('discord_id', discordUserId);

                    await logToChannel(discordUserId);

                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '✅ **Success!** You have been verified and assigned the student role. Welcome to the server!', flags: 64 },
                    });
                } catch (err) {
                    console.error('[Error] Role Assignment Failed:', err);
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '❌ Something went wrong while assigning your role. Please contact an admin.', flags: 64 },
                    });
                }
            }
        }

        return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
    } catch (err) {
        console.error('[Global Error] Interaction Handler:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}
