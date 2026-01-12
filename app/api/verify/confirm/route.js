import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(req) {
    try {
        const { code, userId } = await req.json();

        // 1. Validate Code
        const { data: pending, error: fetchError } = await supabase
            .from('pending_codes')
            .select('*')
            .eq('discord_id', userId)
            .eq('code', code)
            .single();

        if (fetchError || !pending) {
            return NextResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
        }

        // Check expiry
        if (new Date(pending.expires_at) < new Date()) {
            return NextResponse.json({ message: 'Code has expired.' }, { status: 400 });
        }

        // 2. Assign Discord Role
        // Get the User record from Supabase Auth to find their Discord Provider ID
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user) {
            throw new Error('User not found');
        }

        const discordUserId = user.user_metadata.provider_id;

        const guildId = process.env.DISCORD_GUILD_ID;
        const roleId = process.env.DISCORD_ROLE_ID;
        const botToken = process.env.DISCORD_BOT_TOKEN;

        if (!guildId || !roleId || !botToken) {
            console.error('Missing Guild/Role ID or Bot Token in configuration.');
            return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
        }

        // Discord API Call: Add Role
        const discordResponse = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bot ${botToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!discordResponse.ok) {
            const errorData = await discordResponse.json();
            console.error('Discord API Error:', errorData);
            return NextResponse.json({ message: 'Failed to assign Discord role.' }, { status: 500 });
        }

        // 3. Mark as Permanently Verified (Privacy safe)
        // Transfer the hash to the permanent table
        await supabase.from('verifications').insert({
            discord_id: userId,
            email_hash: pending.email_hash
        });

        // Cleanup: Clear pending code
        await supabase.from('pending_codes').delete().eq('discord_id', userId);

        // Log to a Discord Webhook
        if (process.env.DISCORD_LOG_WEBHOOK) {
            await fetch(process.env.DISCORD_LOG_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `✅ **User Verified**: <@${discordUserId}> has been successfully verified!`,
                }),
            });
        }

        return NextResponse.json({ message: 'Success!' });
    } catch (error) {
        console.error('Confirm Error:', error);
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
}
