export async function assignRole(discordUserId) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_ROLE_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !roleId || !botToken) {
        throw new Error('Missing Discord configuration (Guild ID, Role ID, or Bot Token)');
    }

    const response = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Discord Role Error:', errorData);
        throw new Error('Failed to assign Discord role');
    }
    return true;
}

export async function logToChannel(discordUserId, method = 'website') {
    const webhookUrl = process.env.DISCORD_LOG_WEBHOOK;
    if (!webhookUrl) return;

    const methodText = method === 'command'
        ? 'They have received their accepted role using the command.'
        : 'They have received their accepted role using the website.';

    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            flags: 32768,
            components: [
                {
                    type: 17,
                    accent_color: null,
                    components: [
                        {
                            type: 10,
                            content: `# <:Verified:1460379061816787139>  <@${discordUserId}> Has been verified! \n\n-# ${methodText}`
                        }
                    ]
                }
            ]
        }),
    });
}
