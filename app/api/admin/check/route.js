import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerConfig } from '@/lib/config';

export async function GET(req) {
    try {
        const settings = await getServerConfig();
        const guildId = settings.guildId || process.env.DISCORD_GUILD_ID;

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            req.headers.get('Authorization')?.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ isAdmin: false });
        }

        // 2. Verify Authorization (Role-based)
        const discordId = user.user_metadata.provider_id;
        if (!discordId) {
             return NextResponse.json({ isAdmin: false });
        }

        const botToken = process.env.DISCORD_BOT_TOKEN;
        const memberResp = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
            headers: { Authorization: `Bot ${botToken}` }
        });

        if (!memberResp.ok) {
            return NextResponse.json({ isAdmin: false });
        }

        const memberData = await memberResp.json();
        const memberRoles = memberData.roles || [];
        const isAdmin = settings.adminRoleIds.some(roleId => memberRoles.includes(roleId));

        return NextResponse.json({ isAdmin });
    } catch (error) {
        return NextResponse.json({ isAdmin: false });
    }
}
