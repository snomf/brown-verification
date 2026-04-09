// All configuration is pulled dynamically from the database or environment.
import { supabaseAdmin as supabase } from './supabase';

export async function assignRole(discordUserId, roleIds = []) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
        throw new Error('Missing Discord configuration (Guild ID or Bot Token)');
    }

    // Identify which role IDs to add
    const rolesToAdd = Array.isArray(roleIds) ? roleIds : [roleIds];
    
    // Filter out null/undefined
    const validRoles = rolesToAdd.filter(id => !!id);
    
    if (validRoles.length === 0) {
        console.warn('[Discord Warn] assignRole called with no valid role IDs.');
        return true; 
    }

    const results = await Promise.all(validRoles.map(async (rId) => {
        try {
            const response = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${rId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bot ${botToken}`,
                        'Content-Type': 'application/json',
                    },
                });

            if (!response.ok) {
                console.error(`Failed to assign role ${rId}`, await response.text());
                return false;
            }
            return true;
        } catch (e) {
            console.error(`Exception assigning role ${rId}`, e);
            return false;
        }
    }));

    return results.every(res => res !== false);
}

function getOrdinal(n) {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + "st";
    if (j === 2 && k !== 12) return n + "nd";
    if (j === 3 && k !== 13) return n + "rd";
    return n + "th";
}

export async function logToChannel(discordUserId, method = 'website') {
    const webhookUrl = process.env.DISCORD_LOG_WEBHOOK;
    if (!webhookUrl) return;

    let methodText;
    if (method === 'command') {
        methodText = 'They have received their accepted role using the Discord command.';
    } else if (method === 'admin') {
        methodText = 'They were manually verified by an Admin.';
    } else if (method === 'website_google') {
        methodText = 'They have received their accepted role via Google Login (Website).';
    } else if (method === 'command_google') {
        methodText = 'They have received their accepted role via Google Login (Discord Bot).';
    } else {
        methodText = 'They have received their accepted role using the website.';
    }

    let headcountText = '';
    try {
        const { count, error } = await supabase
            .from('verifications')
            .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
            headcountText = `Congratulations to the **${getOrdinal(count)}** student to verify! 🐻`;
        }
    } catch (err) {
        console.error('[Discord Error] Headcount fetch failed:', err);
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [
                    {
                        title: '🐻 User Verified!',
                        description: `<@${discordUserId}> has successfully received the accepted role.\n\n${headcountText}`,
                        fields: [
                            { name: 'Method', value: methodText, inline: true }
                        ],
                        color: 0x591C0B
                    }
                ]
            }),
        });
    } catch (err) {
        console.error('[Discord Error] Webhook logging failed:', err.message);
    }
}
