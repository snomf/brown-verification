import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashEmail } from '@/lib/crypto';
import nodemailer from 'nodemailer';

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
        // We use the service role key for DB operations usually, 
        // but here we rely on the user's auth session for safety if possible, 
        // or just assume the server handles it if RLS is set up.
        const { error: dbError } = await supabase
            .from('pending_codes')
            .upsert({
                discord_id: userId,
                code,
                email_hash: emailHash,
                expires_at: expiresAt.toISOString()
            }, { onConflict: 'discord_id' });

        if (dbError) throw dbError;

        // 5. Send Email
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
            subject: 'Your Brown Verification Code',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444;">Brown University Verification</h2>
          <p>Hello! Use the code below to verify your account in the Discord server.</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
        });

        return NextResponse.json({ message: 'Code sent!' });
    } catch (error) {
        console.error('Request Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}
