// Role assignment helper
// This file no longer contains any hardcoded Discord IDs.
// All configuration is pulled dynamically from the database or environment.

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

export async function logToChannel(discordUserId, method = 'website') {
    const webhookUrl = process.env.DISCORD_LOG_WEBHOOK;
    if (!webhookUrl) return;

    let methodText;
    if (method === 'command') {
        methodText = 'They have received their accepted role using the Discord command.';
    } else if (method === 'admin') {
        methodText = 'They were manually verified by an Admin.';
    } else if (method === 'website_google') {
        methodText = 'They have received their accepted role using Google Login.';
    } else {
        methodText = 'They have received their accepted role using the website.';
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [
                    {
                        title: '🐻 User Verified!',
                        description: `<@${discordUserId}> has successfully received the accepted role.`,
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
