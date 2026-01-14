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
