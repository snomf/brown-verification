import { InteractionType, InteractionResponseType, verifyKey } from 'discord-interactions';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { assignRole, logToChannel } from '@/lib/discord';
import nodemailer from 'nodemailer';

export async function POST(req) {
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');
    const body = await req.text();

    // 1. Verify Request Source (Security)
    const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        process.env.DISCORD_PUBLIC_KEY
    );

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
        const discordUserId = interaction.member.user.id;

        // --- CASE: /verify [email] ---
        if (name === 'verify') {
            const email = options.find((o) => o.name === 'email').value;

            if (!email.toLowerCase().endsWith('@brown.edu')) {
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

            if (dbError) throw dbError;

            // Send Email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"Brown Verification" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Discord Verification Code',
                text: `Your code is: ${code}. Use /confirm code: ${code} in Discord to verify.`,
                html: `<div style="padding: 20px; text-align: center;"><h1>Code: ${code}</h1></div>`,
            });

            return NextResponse.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: '📬 A verification code has been sent to your email! Once received, type `/confirm code: [your-code]`.', flags: 64 },
            });
        }

        // --- CASE: /confirm [code] ---
        if (name === 'confirm') {
            const code = options.find((o) => o.name === 'code').value;

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
                console.error(err);
                return NextResponse.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: '❌ Something went wrong while assigning your role. Please contact an admin.', flags: 64 },
                });
            }
        }
    }

    return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}
