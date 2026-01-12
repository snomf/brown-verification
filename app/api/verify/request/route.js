import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const { email, userId } = await req.json();

        // 1. Basic Validation
        if (!email || !email.toLowerCase().endsWith('@brown.edu')) {
            console.warn('[Verify] 400: Invalid email domain:', email);
            return NextResponse.json({ message: 'Only @brown.edu emails are allowed. Please check for spelling errors.' }, { status: 400 });
        }

        // 2. Check for Duplicate (Privacy Safe)
        const emailHash = hashEmail(email);
        const { data: existing, error: checkError } = await supabase
            .from('verifications')
            .select('id')
            .eq('email_hash', emailHash)
            .maybeSingle();

        if (checkError) {
            console.error('[Verify] Supabase Check Error:', checkError);
            return NextResponse.json({ message: 'Database error. Please try again later.' }, { status: 500 });
        }

        if (existing) {
            console.warn('[Verify] 400: Duplicate email hash detected');
            return NextResponse.json({ message: 'This email has already been used to verify a student.' }, { status: 400 });
        }

        // 3. Generate Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 4. Save Pending Code
        const { error: dbError } = await supabase
            .from('pending_codes')
            .upsert({
                discord_id: userId,
                code,
                email_hash: emailHash,
                expires_at: expiresAt.toISOString()
            }, { onConflict: 'discord_id' });

        if (dbError) {
            console.error('[Verify] Supabase Upsert Error:', dbError);
            throw dbError;
        }

        // 5. Send Email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.error('[Verify] 500: Missing RESEND_API_KEY');
            return NextResponse.json({ message: 'Email service not configured.' }, { status: 500 });
        }

        try {
            // Note: If you have a custom domain verified in Resend, 
            // you should change 'onboarding@resend.dev' to 'verify@yourdomain.com'
            const { data, error: resendError } = await resend.emails.send({
                from: 'Verification Bot <verify@brownv.juainny.com>',
                to: email,
                subject: 'Your Brown Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h2 style="color: #ef4444;">Brown University Verification</h2>
                      <p>Hello! Use the code below to verify your account in the Discord server.</p>
                      <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${code}
                      </div>
                      <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                    </div>
                `,
            });

            if (resendError) {
                console.error('[Verify] Resend Error details:', resendError);
                return NextResponse.json({
                    message: 'Resend failed to send email. Check your domain verification.',
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
            message: 'Internal server error.',
            error: error.message
        }, { status: 500 });
    }
}
