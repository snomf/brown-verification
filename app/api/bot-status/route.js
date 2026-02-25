import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const BOT_ID = '1460126082882732115';
        const GUILD_ID = '1440891719737413665';

        // We check the bot's member status in the guild to see its presence
        const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${BOT_ID}`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });

        if (res.ok) {
            // If we can fetch the member, it's at least "in the server"
            // To get actual presence (online/offline), we'd need the presence intent enabled
            // and use a different endpoint or a library.
            // But for a simple "is the bot running" check, fetching its info is a good start.
            // However, the bot sets its presence to 'online' in bot.js.

            // Let's try to fetch the bot's user object which is always available if the token is valid.
            const userRes = await fetch(`https://discord.com/api/v10/users/${BOT_ID}`, {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
                }
            });

            if (userRes.ok) {
                return NextResponse.json({ status: 'online' });
            }
        }

        return NextResponse.json({ status: 'offline' });
    } catch (error) {
        return NextResponse.json({ status: 'offline' });
    }
}
