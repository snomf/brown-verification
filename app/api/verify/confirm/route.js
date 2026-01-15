import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(req) {
    try {
        const { code, userId, classYear, isAlumni } = await req.json();
        const botToken = process.env.DISCORD_BOT_TOKEN;
        const guildId = process.env.DISCORD_GUILD_ID;

        // Constants
        const ROLES = {
            ALUMNI: '1449839054341410846',
            STUDENT: '1449839196671053895',
            ACCEPTED: process.env.DISCORD_ROLE_ID,
            '2029': '1449839285887963279',
            '2028': '1449839544877846561',
            '2027': '1449839612317925436',
            '2026': '1449839686435471381'
        };

        // 1. Resolve Discord ID (Snowflake)
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user) {
            console.error('[Verify Log] User not found or Auth error:', userError);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const discordUserId = user.user_metadata.provider_id;
        if (!discordUserId) {
            console.error('[Verify Log] provider_id missing in user metadata');
            return NextResponse.json({ message: 'Missing Discord data.' }, { status: 400 });
        }

        // 2. Validate Code using discordUserId (Snowflake)
        const { data: pending, error: fetchError } = await supabase
            .from('pending_codes')
            .select('*')
            .eq('discord_id', discordUserId)
            .eq('code', code)
            .single();

        if (fetchError || !pending) {
            return NextResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
        }

        // Check expiry
        if (new Date(pending.expires_at) < new Date()) {
            return NextResponse.json({ message: 'Code has expired.' }, { status: 400 });
        }

        // 3. Determine Roles to Assign
        const rolesToAssign = [];

        if (isAlumni) {
            rolesToAssign.push(ROLES.ALUMNI);
        } else if (classYear && ROLES[classYear]) {
            rolesToAssign.push(ROLES.ACCEPTED);
            rolesToAssign.push(ROLES.STUDENT);
            rolesToAssign.push(ROLES[classYear]);
        } else {
            // Default Case: Just Accepted
            rolesToAssign.push(ROLES.ACCEPTED);
        }

        // 4. Discord API Call: Add Roles
        const roleResults = await Promise.all(rolesToAssign.map(async (rId) => {
            if (!rId) return true;
            const response = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${rId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.ok;
        }));

        if (roleResults.some(r => !r)) {
            console.error('[Verify Log] Some roles failed to assign.');
        }

        // 5. Mark as Permanently Verified (Privacy safe)
        // Determine Type
        let verificationType = 'accepted';
        if (isAlumni) {
            verificationType = 'alumni';
        } else if (classYear && ROLES[classYear]) {
            verificationType = classYear;
        }

        // Transfer the hash to the permanent table (Use Snowflake discordUserId)
        await supabase.from('verifications').upsert({
            discord_id: discordUserId,
            email_hash: pending.email_hash,
            verification_method: 'website',
            verified_at: new Date().toISOString(),
            type: verificationType
        }, { onConflict: 'discord_id' });

        // 6. Cleanup: Clear pending code
        await supabase.from('pending_codes').delete().eq('discord_id', discordUserId);

        // 7. Log to a Discord Webhook
        if (process.env.DISCORD_LOG_WEBHOOK) {
            try {
                const { logToChannel } = await import('@/lib/discord');
                await logToChannel(discordUserId, 'website');
            } catch (webhookErr) {
                console.error('[Verify Log] Webhook failed:', webhookErr.message);
            }
        }

        return NextResponse.json({ message: 'Success!' });
    } catch (error) {
        console.error('Confirm Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}
