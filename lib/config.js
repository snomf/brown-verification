import { supabaseAdmin as supabase } from './supabase';

/**
 * Universal Configuration Manager
 * Fetches Discord roles, channels, and statuses from the Supabase `server_settings` table.
 * Falls back to process.env if the table is empty or missing, ensuring the bot never breaks.
 */
export async function getServerConfig() {
    try {
        // We only use the single row with id = 1
        const { data, error } = await supabase.from('server_settings').select('*').eq('id', 1).single();
        
        if (error) {
            console.warn('[Config Warn] Could not fetch server_settings from DB. Falling back to .env', error.message);
        }

        // Merge DB data with fallbacks from process.env (no hardcoded IDs in the code!)
        return {
            guildId: data?.guild_id || process.env.DISCORD_GUILD_ID,
            botId: data?.bot_id || process.env.DISCORD_CLIENT_ID,
            adminRoleIds: data?.admin_role_ids ? data.admin_role_ids.split(',').map(id => id.trim()) : (process.env.DISCORD_ADMIN_ROLE_ID ? [process.env.DISCORD_ADMIN_ROLE_ID] : []),
            modChannelId: data?.mod_review_channel_id || process.env.MOD_REVIEW_CHANNEL_ID,
            allowedModRoleIds: data?.allowed_mod_role_ids ? data.allowed_mod_role_ids.split(',').map(id => id.trim()) : (process.env.ALLOWED_MOD_ROLE_IDS ? process.env.ALLOWED_MOD_ROLE_IDS.split(',').map(id => id.trim()) : []),

            emailFromAddress: data?.email_from_address || process.env.EMAIL_FROM_ADDRESS || 'Bruno Verifies <verify@brunov.juainny.com>',
            allowedEmailDomains: data?.allowed_email_domains ? data.allowed_email_domains.split(',').map(id => id.trim()) : (process.env.ALLOWED_EMAIL_DOMAINS ? process.env.ALLOWED_EMAIL_DOMAINS.split(',').map(id => id.trim()) : ['@brown.edu', '@alumni.brown.edu']),
            
            botStatusPresence: data?.bot_status_presence || 'online',
            botStatusText: data?.bot_status_text || "ROARRRRRRRRR! 🐻 I'm verifying Brown Students!",

            roles: {
                ACCEPTED: data?.role_accepted || process.env.DISCORD_ROLE_ID,
                CERTIFIED: data?.role_certified || process.env.DISCORD_CERTIFIED_ROLE_ID,
                ALUMNI: data?.role_alumni || process.env.DISCORD_ALUMNI_ROLE_ID,
                STUDENT: data?.role_student || process.env.DISCORD_STUDENT_ROLE_ID,
                '2026': data?.role_2026 || process.env.DISCORD_ROLE_2026,
                '2027': data?.role_2027 || process.env.DISCORD_ROLE_2027,
                '2028': data?.role_2028 || process.env.DISCORD_ROLE_2028,
                '2029': data?.role_2029 || process.env.DISCORD_ROLE_2029,
                '2030': data?.role_2030 || process.env.DISCORD_ROLE_2030
            }
        };
    } catch (err) {
        console.error('[Config Error] Unexpected error fetching config:', err);
        return {
            adminRoleIds: process.env.DISCORD_ADMIN_ROLE_ID ? [process.env.DISCORD_ADMIN_ROLE_ID] : [],
            modChannelId: process.env.MOD_REVIEW_CHANNEL_ID,
            botStatusPresence: 'online',
            botStatusText: "ROARRRRRRRRR! 🐻 I'm verifying Students!",
            roles: {
                ACCEPTED: process.env.DISCORD_ROLE_ID,
                CERTIFIED: process.env.DISCORD_CERTIFIED_ROLE_ID,
            }
        };
    }
}
