import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        console.log('[Verify Log] POST /api/verify/request started');
        const body = await req.json();
        const { email, userId } = body;

        console.log('[Verify Log] Received data:', { email: 'HIDDEN', userId: userId ? 'Present' : 'MISSING' });

        // 1. Basic Validation
        const isAllowedDomain = email.toLowerCase().endsWith('@brown.edu') || email.toLowerCase().endsWith('@alumni.brown.edu');
        if (!email || !isAllowedDomain) {
            console.warn('[Verify Log] 400: Invalid email domain (PII hidden)');
            return NextResponse.json({ message: 'Only @brown.edu or @alumni.brown.edu emails are allowed. Are you lost, friend?' }, { status: 400 });
        }

        if (!userId) {
            console.error('[Verify Log] 400: Missing userId in request');
            return NextResponse.json({ message: 'I can\'t tell who you are! Profile missing.' }, { status: 400 });
        }

        // 2. Check for Duplicate (Privacy Safe)
        const emailHash = hashEmail(email);
        console.log('[Verify Log] Hash generated, checking for duplicate...');
        const { data: existing, error: checkError } = await supabase
            .from('verifications')
            .select('id')
            .eq('email_hash', emailHash)
            .maybeSingle();

        if (checkError) {
            console.error('[Verify Log] Supabase Check Error:', checkError);
            return NextResponse.json({ message: 'Bear brain freeze (Database error).' }, { status: 500 });
        }

        if (existing) {
            console.warn('[Verify Log] 400: Duplicate email hash detected');
            return NextResponse.json({ message: 'That email is already verified! No double-dipping!' }, { status: 400 });
        }

        // 3. Generate Code
        console.log('[Verify Log] Generating verification code...');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 4. Save Pending Code
        console.log('[Verify Log] Saving code to Supabase pending_codes...');
        const { error: dbError } = await supabase
            .from('pending_codes')
            .upsert({
                discord_id: userId,
                code,
                email_hash: emailHash,
                expires_at: expiresAt.toISOString()
            }, { onConflict: 'discord_id' });

        if (dbError) {
            console.error('[Verify Log] Supabase Upsert Error:', dbError);
            return NextResponse.json({ message: 'Failed to put the code in the vault.', error: dbError.message }, { status: 500 });
        }

        console.log('[Verify Log] Code saved! Preparing to send email...');

        // 5. Send Email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.error('[Verify Log] 500: Missing RESEND_API_KEY in environment');
            return NextResponse.json({ message: 'Carrier pigeons unconfigured.' }, { status: 500 });
        }

        try {
            const { data, error: resendError } = await resend.emails.send({
                from: 'Bruno Verifies <verify@brunov.juainny.com>',
                to: email,
                subject: 'Bruno\'s Secret Code for You',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #FDFBF7; border-radius: 20px; text-align: center;">
                      <h1 style="color: #591C0B; font-size: 28px;">Verification Time! 🐻</h1>
                      <p style="font-size: 16px; color: #4A3728;">Hi Brunonian! Grab this code to verify your acceptance:</p>
                      
                      <div style="background: #FFF; border: 2px dashed #CE1126; padding: 20px; text-align: center; border-radius: 12px; font-size: 36px; font-weight: 800; letter-spacing: 5px; margin: 30px auto; color: #CE1126; max-width: 200px;">
                        ${code}
                      </div>
                      
                      <p style="color: #8C6B5D; font-size: 14px;">This code self-destructs (expires) in 10 minutes.</p>
                      <hr style="border: 0; border-top: 1px solid #CE1126; opacity: 0.2; margin: 30px 0;">
                      <p style="color: #8C6B5D; font-size: 12px;">
                        <a href="https://brunov.juainny.com/privacy" style="color: #CE1126; text-decoration: none; font-weight: bold;">Privacy Policy</a> • We hashed your email to protect your identity.
                      </p>
                    </div>
                `,
            });

            if (resendError) {
                console.error('[Verify] Resend Error details:', resendError);
                return NextResponse.json({
                    message: 'The pigeon got lost (Email failed).',
                    error: resendError.message
                }, { status: 500 });
            }
        } catch (emailErr) {
            console.error('[Verify] Resend Exception:', emailErr);
            throw emailErr;
        }

        return NextResponse.json({ message: 'Code sent!' });
    } catch (error) {
        console.error('[Verify] Global 500 Error:', error);
        return NextResponse.json({
            message: 'Internal bear error.',
            error: error.message
        }, { status: 500 });
    }
}
