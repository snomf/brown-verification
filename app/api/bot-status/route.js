import { NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config';

export async function GET() {
    try {
        const settings = await getServerConfig();
        const botId = settings.botId || process.env.DISCORD_CLIENT_ID;
        const guildId = settings.guildId || process.env.DISCORD_GUILD_ID;

        if (!botId || !guildId) {
            return NextResponse.json({ status: 'offline', error: 'Missing configuration' });
        }

        const botToken = process.env.DISCORD_BOT_TOKEN;

        // Try to fetch the bot's user object to verify the token/ID are valid
        const userRes = await fetch(`https://discord.com/api/v10/users/${botId}`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (userRes.ok) {
            return NextResponse.json({ status: 'online' });
        }

        return NextResponse.json({ status: 'offline' });
    } catch (error) {
        return NextResponse.json({ status: 'offline' });
    }
}
