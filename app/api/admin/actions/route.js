import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const ADMIN_ID = '547599059024740374';
const GUILD_ID = '1440891719737413665';

export async function POST(req) {
    try {
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

        // 2. Verify Authorization (Check if Admin)
        const adminDiscordId = user.user_metadata.provider_id;
        if (adminDiscordId !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized. Admins only!' }, { status: 403 });
        }

        const body = await req.json();
        const { discordId, action } = body;

        if (action === 'revoke') {
            // 3. Remove roles from Discord FIRST
            const ROLES_TO_REMOVE = [
                process.env.DISCORD_ROLE_ID, // Accepted
                '1449839054341410846', // Alumni
                '1449839196671053895', // Student
                '1449839285887963279', // 2029
                '1449839544877846561', // 2028
                '1449839612317925436', // 2027
                '1449839686435471381'  // 2026
            ];

            let discordRemovalSuccess = true;
            for (const roleId of ROLES_TO_REMOVE) {
                if (!roleId) continue;
                try {
                    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
                        }
                    });
                    // Note: If member is not in guild or role is already removed, Discord returns 404, which we can ignore
                    if (!res.ok && res.status !== 404) {
                         console.warn(`Unexpected Discord API response while removing role ${roleId}: ${res.status}`);
                    }
                } catch (err) {
                    console.error(`Failed to remove role ${roleId} from ${discordId}:`, err);
                    // We don't set discordRemovalSuccess to false here because we want to at least try all roles
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
