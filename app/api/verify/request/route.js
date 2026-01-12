import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const { email, userId } = await req.json();

        // 1. Basic Validation
        if (!email || !email.endsWith('@brown.edu')) {
            return NextResponse.json({ message: 'Only Brown University emails are allowed.' }, { status: 400 });
        }

        // 2. Check for Duplicate (Privacy Safe)
        const emailHash = hashEmail(email);
        const { data: existing } = await supabase
            .from('verifications')
            .select('id')
            .eq('email_hash', emailHash)
            .single();

        if (existing) {
            return NextResponse.json({ message: 'This email has already been used for verification.' }, { status: 400 });
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

        if (dbError) throw dbError;

        // 5. Send Email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.error('[Error] Missing RESEND_API_KEY');
            return NextResponse.json({ message: 'Email service not configured on Vercel.' }, { status: 500 });
        }

        try {
            const { data, error: resendError } = await resend.emails.send({
                from: 'Verification Bot <onboarding@resend.dev>',
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
                console.error('[Resend Error]:', resendError);
                return NextResponse.json({
                    message: 'Email failed to send. Note: Resend Free Tier only allows sending to your own email address.',
                    details: resendError.message
                }, { status: 500 });
            }
        } catch (emailErr) {
            console.error('[Resend Exception]:', emailErr);
            throw emailErr;
        }

        return NextResponse.json({ message: 'Code sent!' });
    } catch (error) {
        console.error('Request Error details:', error);
        return NextResponse.json({
            message: 'Internal server error.',
            error: error.message
        }, { status: 500 });
    }
}
