// Role Definitions
const ROLES = {
    ALUMNI: '1449839054341410846',
    STUDENT: '1449839196671053895',
    ACCEPTED: process.env.DISCORD_ROLE_ID, // Defines the default 'Accepted' role
    CLASS_29: '1449839285887963279',
    CLASS_28: '1449839544877846561',
    CLASS_27: '1449839612317925436',
    CLASS_26: '1449839686435471381'
};

export const ROLE_IDS = ROLES;

export async function assignRole(discordUserId, roleIds = []) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
        throw new Error('Missing Discord configuration (Guild ID or Bot Token)');
    }

    // Identify which role IDs to add
    // If input is a single string, wrap it in array.
    const rolesToAdd = Array.isArray(roleIds) ? roleIds : [roleIds];
    if (rolesToAdd.length === 0) rolesToAdd.push(ROLES.ACCEPTED); // Default fallback

    const results = await Promise.all(rolesToAdd.map(async (rId) => {
        if (!rId) return null;

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
        methodText = 'They have received their accepted role using the command.';
    } else if (method === 'admin') {
        methodText = 'They were manually verified by an Admin.';
    } else {
        methodText = 'They have received their accepted role using the website.';
    }

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
}
