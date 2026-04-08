import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerConfig } from '@/lib/config';

export async function POST(req) {
    try {
        const { userId, classYear } = await req.json();
        
        const settings = await getServerConfig();
        const guildId = settings.guildId || process.env.DISCORD_GUILD_ID;
        const ROLES = settings.roles;

        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user) throw new Error('User not found.');

        const googleIdentity = user.identities?.find(i => i.provider === 'google');
        if (!googleIdentity) throw new Error('No Google identity linked.');

        const email = googleIdentity.identity_data.email?.toLowerCase();
        if (!email) throw new Error('No email found in Google identity.');

        const allowedDomains = settings.allowedEmailDomains || ['@brown.edu', '@alumni.brown.edu'];
        const isAllowedDomain = allowedDomains.some(domain => email.endsWith(domain));

        if (!isAllowedDomain) {
            throw new Error('Email must be @brown.edu or @alumni.brown.edu');
        }

        const isAlumni = email.endsWith('alumni.brown.edu') || email.includes('alumni');
        const isStudent = !isAlumni;

        const discordIdentity = user.identities?.find(i => i.provider === 'discord');
        if (!discordIdentity) throw new Error('No Discord identity linked.');

        const discordUserId = discordIdentity.id;

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
                verificationType = '2030';
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

        try {
            const resp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
                }
            });
            if (!resp.ok) throw new Error("Discord member not found.");
            
            const memberData = await resp.json();
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

        const { error: insertError } = await supabase.from('verifications').upsert({
            discord_id: discordUserId,
            email_hash: 'google_oauth_' + discordUserId,
            verification_method: 'website_google',
            verified_at: new Date().toISOString(),
            type: verificationType
        }, { onConflict: 'discord_id' });

        if (insertError) {
            console.error('Failed to log Google verification to DB:', insertError);
        }

        return NextResponse.json({ success: true, message: successMsg });
    } catch (error) {
        console.error('Google Verify Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
