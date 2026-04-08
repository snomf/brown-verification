import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { getServerConfig } from '@/lib/config';

export async function POST(req) {
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

        // Fetch member from Discord to check roles
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

        const body = await req.json();
        const { discordId, action } = body;

        if (action === 'revoke') {
            // 3. Remove ALL verification roles from Discord dynamically
            const ALL_VERIFICATION_ROLES = Object.values(settings.roles).filter(id => !!id);

            for (const roleId of ALL_VERIFICATION_ROLES) {
                try {
                    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bot ${botToken}` }
                    });
                    if (!res.ok && res.status !== 404) {
                         console.warn(`Unexpected Discord API response while removing role ${roleId}: ${res.status}`);
                    }
                } catch (err) {
                    console.error(`Failed to remove role ${roleId} from ${discordId}:`, err);
                }
            }

            // 4. Remove from database
            const { error: dbError } = await supabase
                .from('verifications')
                .delete()
                .eq('discord_id', discordId);

            if (dbError) throw dbError;

            return NextResponse.json({ message: 'Verification revoked' });
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Admin Action Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
