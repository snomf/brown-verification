import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerConfig } from '@/lib/config';

export async function GET(req) {
    try {
        const settings = await getServerConfig();
        const guildId = settings.guildId || process.env.DISCORD_GUILD_ID;

        // 1. Verify Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // 2. Verify Authorization (Role-based)
        const adminDiscordId = user.user_metadata.provider_id;
        if (!adminDiscordId) {
             return NextResponse.json({ error: 'Account not linked to Discord.' }, { status: 403 });
        }

        const botToken = process.env.DISCORD_BOT_TOKEN;
        const memberResp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${adminDiscordId}`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (!memberResp.ok) {
            return NextResponse.json({ error: 'Could not verify your Discord membership.' }, { status: 403 });
        }

        const memberData = await memberResp.json();
        const memberRoles = memberData.roles || [];
        const isAdmin = settings.adminRoleIds.some(roleId => memberRoles.includes(roleId));

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized. Admins only!' }, { status: 403 });
        }

        // 3. Fetch Verifications
        const { data: verifications, error: vError } = await supabase
            .from('verifications')
            .select('*')
            .order('verified_at', { ascending: false });

        if (vError) throw vError;

        // 4. Fetch Discord info for each user
        const verificationsWithDiscord = await Promise.all(verifications.map(async (v) => {
            try {
                const discordRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${v.discord_id}`, {
                    headers: { Authorization: `Bot ${botToken}` }
                });
                const discordData = await discordRes.json();

                if (discordRes.ok) {
                    return {
                        ...v,
                        discordUser: {
                            username: discordData.user.username,
                            displayName: discordData.nick || discordData.user.global_name || discordData.user.username,
                            avatar: discordData.user.avatar
                                ? `https://cdn.discordapp.com/avatars/${v.discord_id}/${discordData.user.avatar}.png`
                                : null,
                            roles: discordData.roles
                        }
                    };
                } else {
                    const userRes = await fetch(`https://discord.com/api/v10/users/${v.discord_id}`, {
                        headers: { Authorization: `Bot ${botToken}` }
                    });
                    const userData = await userRes.json();
                    if (userRes.ok) {
                        return {
                            ...v,
                            discordUser: {
                                username: userData.username,
                                displayName: userData.global_name || userData.username,
                                avatar: userData.avatar
                                    ? `https://cdn.discordapp.com/avatars/${v.discord_id}/${userData.avatar}.png`
                                    : null,
                                roles: []
                            }
                        };
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch Discord user ${v.discord_id}:`, err);
            }
            return v;
        }));

        const stats = {
            total: verifications.length,
            student: verifications.filter(v => v.type !== 'alumni').length,
            alumni: verifications.filter(v => v.type === 'alumni').length
        };

        return NextResponse.json({ verifications: verificationsWithDiscord, stats });
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
