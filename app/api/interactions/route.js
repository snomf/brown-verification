import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
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

        if (!signature || !timestamp || !publicKey) {
            return new Response('Bad request signature', { status: 401 });
        }

        // 1. Verify Request Source (Security)
        let isValidRequest = false;
        try {
            isValidRequest = await verifyKey(body, signature, timestamp, publicKey);
        } catch (err) {
            console.error('[Discord Debug] verifyKey exception:', err.message);
        }

        if (!isValidRequest) {
            return new Response('Bad request signature', { status: 401 });
        }

        const interaction = JSON.parse(body);

        // 2. Handle Handshake (required by Discord)
        if (interaction.type === InteractionType.PING) {
            return NextResponse.json({ type: InteractionResponseType.PONG });
        }

        // 3. Handle Slash Commands
        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const { name, options } = interaction.data;
            const discordUserId = interaction.member?.user?.id || interaction.user?.id;

            if (!discordUserId) {
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: '<:BearShock:1460381158134120529> Roar?! I can\'t see your User ID! Try again?', flags: 64 },
                });
            }

            // --- CASE: /verify [email] ---
            if (name === 'verify') {
                const emailOption = options.find((o) => o.name === 'email');
                let email = emailOption?.value?.trim().toLowerCase();

                if (!email) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:bearbear:1458612533492711434> Give me a name or email to sniff!', flags: 64 },
                    });
                }

                // Auto-append @brown.edu if no domain is provided
                if (!email.includes('@')) {
                    email = `${email}@brown.edu`;
                }

                if (!email.endsWith('@brown.edu')) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:bearbear:1458612533492711434> Grr... that doesn\'t look like a **@brown.edu** email! Are you sure you\'re in the right place?', flags: 64 },
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
                        data: {
                            content: '<:BearShock:1460381158134120529> Oh no! That email is already in my list! One bear per student, please!\n\nCheck our [Privacy Policy](https://brunov.juainny.com/privacy) to see how we securely hash your data.',
                            flags: 64
                        },
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
                    throw dbError;
                }

                try {
                    const { data, error: resendError } = await resend.emails.send({
                        from: 'Bruno Verifies <verify@brunov.juainny.com>',
                        to: email,
                        subject: 'Your Bruno Verification Code',
                        html: `
                          <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                            <h1 style="color: #591C0B;">Bruno sent you a code! 🐻</h1>
                            <p>Hi Brunonian! Grab this code to verify your acceptance:</p>
                            <div style="background: #FDFBF7; color: #CE1126; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; border: 2px dashed #591C0B; border-radius: 15px; margin: 20px auto; max-width: 300px;">
                              ${code}
                            </div>
                            <p>Go back to Discord and type <strong>/confirm code: ${code}</strong></p>
                            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                                <a href="https://brunov.juainny.com/privacy" style="color: #CE1126; text-decoration: none;">Privacy Policy</a> • We do not store your email.
                            </p>
                          </div>
                        `,
                    });

                    if (resendError) {
                        return NextResponse.json({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: {
                                content: `<:BearShock:1460381158134120529> The email machine is broken! (Error: ${resendError.message})`,
                                flags: 64
                            },
                        });
                    }
                } catch (emailErr) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:BearShock:1460381158134120529> I tripped and dropped the email! Please try again later.', flags: 64 },
                    });
                }

                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `<:bearbear:1458612533492711434> I sent my pigeon friend to **${email}**! When you get the code, type \`/confirm code: [your-code]\`.\n\n🔒 [Privacy Policy](https://brunov.juainny.com/privacy)`,
                        flags: 64
                    },
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
                        data: { content: '<:BearShock:1460381158134120529> Specific code not found! Are you sure you typed it right?', flags: 64 },
                    });
                }

                if (new Date(pending.expires_at) < new Date()) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:bearbear:1458612533492711434> That code is stale! Like old honey. Run `/verify` again!', flags: 64 },
                    });
                }

                // Assign Role & Log
                try {
                    await assignRole(discordUserId);

                    await supabase.from('verifications').insert({
                        discord_id: discordUserId,
                        email_hash: pending.email_hash,
                        verification_method: 'command'
                    });

                    await supabase.from('pending_codes').delete().eq('discord_id', discordUserId);

                    await logToChannel(discordUserId, 'command');

                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:Verified:1460379061816787139> **You\'re in!** I\'ve sniffed you out and you\'re legit. Welcome to the sleuth Brunonian! <:Brown:1449845697506705501>', flags: 64 },
                    });
                } catch (err) {
                    return NextResponse.json({
                        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { content: '<:BearShock:1460381158134120529> I verified you, but I couldn\'t give you the role! Yell at an admin!', flags: 64 },
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
