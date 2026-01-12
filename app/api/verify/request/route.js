import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        console.log('[Verify Log] POST /api/verify/request started');
        const body = await req.json();
        const { email, userId } = body;

        console.log('[Verify Log] Received data:', { email, userId: userId ? 'Present' : 'MISSING' });

        // 1. Basic Validation
        if (!email || !email.toLowerCase().endsWith('@brown.edu')) {
            console.warn('[Verify Log] 400: Invalid email domain:', email);
            return NextResponse.json({ message: 'Only @brown.edu emails are allowed. Please check for spelling errors.' }, { status: 400 });
        }

        if (!userId) {
            console.error('[Verify Log] 400: Missing userId in request');
            return NextResponse.json({ message: 'User ID is missing. Please re-login with Discord.' }, { status: 400 });
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
            return NextResponse.json({ message: 'Database error while checking email status.' }, { status: 500 });
        }

        if (existing) {
            console.warn('[Verify Log] 400: Duplicate email hash detected');
            return NextResponse.json({ message: 'This email has already been used to verify a student.' }, { status: 400 });
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
            return NextResponse.json({ message: 'Failed to store verification code in database.', error: dbError.message }, { status: 500 });
        }

        console.log('[Verify Log] Code saved! Preparing to send email...');

        // 5. Send Email via Resend
        if (!process.env.RESEND_API_KEY) {
            console.error('[Verify Log] 500: Missing RESEND_API_KEY in environment');
            return NextResponse.json({ message: 'Email service not configured.' }, { status: 500 });
        }

        try {
            // Note: If you have a custom domain verified in Resend, 
            // you should change 'onboarding@resend.dev' to 'verify@yourdomain.com'
            const { data, error: resendError } = await resend.emails.send({
                from: 'Verification Bot <verify@brunov.juainny.com>',
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

// DEBUG GET: Visit /api/verify/request in your browser to check Resend connection
export async function GET() {
    try {
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({
                status: 'Error',
                message: 'RESEND_API_KEY is missing from environment variables.'
            }, { status: 500 });
        }

        let domainResponse;
        try {
            domainResponse = await resend.domains.list();
        } catch (e) {
            domainResponse = { error: { message: e.message } };
        }

        const isRestricted = domainResponse.error?.name === 'restricted_api_key';

        return NextResponse.json({
            status: 'Diagnostic Info',
            resend_api_configured: true,
            api_key_prefix: process.env.RESEND_API_KEY.substring(0, 5) + '...',
            key_status: isRestricted ? 'Restricted (Send-Only)' : 'Full Access or Other',
            current_from_domain: 'brunov.juainny.com',
            raw_resend_error: domainResponse.error || null,
            advice: isRestricted
                ? 'Your API key is restricted to SENDING ONLY. This is fine, but make sure you have added brunov.juainny.com as a verified domain in Resend and that your key is allowed to send from it.'
                : 'Check if your domain is verified in the Resend Dashboard.'
        });
    } catch (err) {
        return NextResponse.json({
            status: 'Exception',
            message: err.message
        }, { status: 500 });
    }
}
