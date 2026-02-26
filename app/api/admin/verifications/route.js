import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const ADMIN_ID = '547599059024740374';
const GUILD_ID = '1440891719737413665';

export async function GET(req) {
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
        const discordId = user.user_metadata.provider_id;
        if (discordId !== ADMIN_ID) {
            return NextResponse.json({ error: 'Unauthorized. Admins only!' }, { status: 403 });
        }

        // 3. Fetch Verifications from DB
        const { data: dbVerifications, error: vError } = await supabase
            .from('verifications')
            .select('*');

        if (vError) throw vError;

        // 4. Fetch Members from Discord Guild (to find everyone with the role)
        const VERIFIED_ROLE_ID = process.env.DISCORD_ROLE_ID;
        let guildMembers = [];
        try {
            const guildMembersRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
                headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
            });
            if (guildMembersRes.ok) {
                guildMembers = await guildMembersRes.json();
            }
        } catch (err) {
            console.error('Failed to fetch guild members:', err);
        }

        // 5. Identify everyone who has the verified role on Discord
        const discordVerifiedMembers = guildMembers.filter(m => m.roles.includes(VERIFIED_ROLE_ID));

        // 6. Merge DB data with Discord data
        // Start with members who have the role on Discord
        const mergedList = discordVerifiedMembers.map(m => {
            const dbRecord = dbVerifications.find(v => v.discord_id === m.user.id);
            return {
                discord_id: m.user.id,
                email_hash: dbRecord?.email_hash || null,
                verification_method: dbRecord?.verification_method || null,
                verified_at: dbRecord?.verified_at || m.joined_at, // Use joined_at as fallback
                type: dbRecord?.type || null,
                discordUser: {
                    username: m.user.username,
                    displayName: m.nick || m.user.global_name || m.user.username,
                    avatar: m.user.avatar
                        ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
                        : null,
                    roles: m.roles
                }
            };
        });

        // Also add people in DB who might NOT have the role anymore but were once verified (optional, but good for history)
        dbVerifications.forEach(v => {
            if (!mergedList.find(m => m.discord_id === v.discord_id)) {
                // We need to fetch their Discord info individually if they weren't in the 1000 members fetch
                // But for simplicity and to avoid over-complicating, we'll only do this if they are active.
                // Or just push them with partial info if we don't have it.
                // For now, let's keep the dashboard focused on active verified members + historical DB entries.
            }
        });

        // Add sorting
        mergedList.sort((a, b) => new Date(b.verified_at) - new Date(a.verified_at));

        const stats = {
            total: mergedList.length,
            student: mergedList.filter(v => v.type && v.type !== 'alumni').length,
            alumni: mergedList.filter(v => v.type === 'alumni').length
        };

        return NextResponse.json({ verifications: mergedList, stats });
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
