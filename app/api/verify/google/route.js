import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerConfig } from '@/lib/config';
import { logToChannel } from '@/lib/discord';

export async function POST(req) {
    try {
        const { userId, classYear, token } = await req.json();
        
        const settings = await getServerConfig();
        const guildId = settings.guildId || process.env.DISCORD_GUILD_ID;
        const ROLES = settings.roles;

        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user) throw new Error('User not found.');

        const googleIdentity = user.identities?.find(i => i.provider === 'google') || (user.app_metadata?.provider === 'google' ? { identity_data: user.user_metadata } : null);
        if (!googleIdentity) throw new Error('No Google identity linked.');

        const email = googleIdentity.identity_data.email?.toLowerCase();
        if (!email) throw new Error('No email found in Google identity.');

        let discordUserId;

        if (token) {
            // Token Bypass Logic
            const { data: tokenRecord, error: tokenError } = await supabase
                .from('verify_tokens')
                .select('*')
                .eq('token', token)
                .single();

            if (tokenError || !tokenRecord) throw new Error('Invalid or expired verification token.');
            if (new Date(tokenRecord.expires_at) < new Date()) {
                await supabase.from('verify_tokens').delete().eq('token', token);
                throw new Error('Verification token has expired.');
            }

            discordUserId = tokenRecord.discord_id;
            // Cleanup token
            await supabase.from('verify_tokens').delete().eq('token', token);
        } else {
            // Original Identity Logic
            const discordIdentity = user.identities?.find(i => i.provider === 'discord');
            if (!discordIdentity) throw new Error('No Discord identity linked. Please log in with Discord first or use the bot command.');
            discordUserId = discordIdentity.id;
        }

        const allowedDomains = settings.allowedEmailDomains || ['@brown.edu', '@alumni.brown.edu'];
        const isAllowedDomain = allowedDomains.some(domain => email.endsWith(domain));

        if (!isAllowedDomain) {
            throw new Error('Email must be @brown.edu or @alumni.brown.edu');
        }

        const isAlumni = email.endsWith('alumni.brown.edu') || email.includes('alumni');

        // Roles
        const rolesToAssign = [];
        let successMsg = '';
        let verificationType = 'accepted';

        if (isAlumni) {
            rolesToAssign.push(ROLES.ALUMNI);
            rolesToAssign.push(ROLES.ACCEPTED);
            rolesToAssign.push(ROLES.CERTIFIED);
            verificationType = 'alumni';
            successMsg = "Welcome back, Alumni! Verified via Google.";
        } else {
            rolesToAssign.push(ROLES.ACCEPTED);
            rolesToAssign.push(ROLES.CERTIFIED);
            
            if (classYear === '2030') {
                rolesToAssign.push(ROLES.STUDENT);
                verificationType = 'accepted';
                successMsg = "Welcome, Class of '30! Verified via Google.";
            } else if (classYear && ROLES[classYear]) {
                rolesToAssign.push(ROLES.STUDENT);
                rolesToAssign.push(ROLES[classYear]);
                verificationType = classYear;
                successMsg = `Welcome back, Class of '${classYear.slice(2)}! Verified via Google.`;
            } else {
                successMsg = "Verified via Google! 100% Brunonian.";
            }
        }

        let discordUsername = 'Brunonian';
        try {
            const resp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
                }
            });
            if (!resp.ok) throw new Error("Discord member not found.");
            
            const memberData = await resp.json();
            discordUsername = memberData.user?.username || 'Brunonian';
            const currentRoles = memberData.roles || [];

            for (const roleId of rolesToAssign) {
                if (roleId && !currentRoles.includes(roleId)) {
                    await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
                        }
                    });
                }
            }
        } catch (discordErr) {
            console.error("Discord Role Assignment Error:", discordErr);
            throw new Error('Failed to assign Discord roles. Are you in the server?');
        }

        const methodToLog = token ? 'command_google' : 'website_google';

        const { error: insertError } = await supabase.from('verifications').upsert({
            discord_id: discordUserId,
            email_hash: 'google_oauth_' + discordUserId,
            verification_method: methodToLog,
            verified_at: new Date().toISOString(),
            type: verificationType
        }, { onConflict: 'discord_id' });

        if (insertError) {
            console.error('Failed to log Google verification to DB:', insertError);
        }

        // Log to Discord Channel
        logToChannel(discordUserId, methodToLog).catch(console.error);

        return NextResponse.json({ success: true, message: successMsg, discordUsername });
    } catch (error) {
        console.error('Google Verify Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
