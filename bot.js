const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const crypto = require('crypto');

const VERSION = '1.0.1';

/**
 * BRUNO VERIFIES - PERSISTENT BOT (RESTORED)
 * Version: 1.0.1
 * This script runs 24/7 on DisCloud to keep Bruno "Online"
 */

console.log(`[Bruno Bot] Version ${VERSION} Starting...`);
console.log('[Bruno Debug] Current Directory:', process.cwd());
console.log('[Bruno Debug] __dirname:', __dirname);
console.log('[Bruno Debug] Attempting to load .env from:', path.join(__dirname, '.env'));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// Environment variable helper
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL ERROR: Supabase configuration is missing or empty!');
    console.error('Check your DisCloud Environment Variables or .env file.');
    process.exit(1);
}

let supabase;
try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (err) {
    console.error('CRITICAL ERROR: Failed to initialize Supabase client:', err.message);
    process.exit(1);
}
if (!process.env.RESEND_API_KEY) {
    console.warn('[Bruno Warn] RESEND_API_KEY is missing! Emails will fail.');
}
const resend = new Resend(process.env.RESEND_API_KEY);

function hashEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    return crypto.createHash('sha256').update(cleanEmail).digest('hex');
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bruno is ONLINE. Sniffing for logs...');

    client.user.setPresence({
        activities: [{ name: 'Brown Students that want to verify', type: 2 }],
        status: 'online',
    });
});


// Webhook Logger
async function logToChannel(discordUserId, method = 'command') {
    const webhookUrl = process.env.DISCORD_LOG_WEBHOOK;
    if (!webhookUrl) {
        console.warn('[Bruno Warn] No DISCORD_LOG_WEBHOOK configured.');
        return;
    }

    try {
        const methodText = method === 'command'
            ? 'They have received their accepted role using the command.'
            : 'They have received their accepted role using the website.';

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
        console.log(`[Bruno Log] Logged verification for ${discordUserId} to webhook.`);
    } catch (err) {
        console.error('[Bruno Error] Failed to send webhook log:', err.message);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user, guildId } = interaction;
    const discordUserId = user.id;

    if (commandName === 'verify') {
        await interaction.deferReply({ ephemeral: true });

        let email = options.getString('email')?.trim().toLowerCase();
        if (!email) return interaction.editReply('Sniff... you forgot to give me an email! Lets give that another try? <:bearbear:1458612533492711434>');

        if (!email.includes('@')) {
            email = `${email}@brown.edu`;
        }

        if (!email.endsWith('@brown.edu')) {
            return interaction.editReply('<:bearbear:1458612533492711434> Grr... that doesn\'t look like a **@brown.edu** email! Are you really a brunonian? <:bearbear:1458612533492711434>');
        }

        try {
            console.log(`[Bruno Log] Verifying for User ${discordUserId}`);
            const emailHash = hashEmail(email);

            // Check existing
            const { data: existing, error: checkError } = await supabase
                .from('verifications')
                .select('id')
                .eq('email_hash', emailHash)
                .maybeSingle();

            if (checkError) {
                console.error('[Bruno Error] Supabase Check Failed:', checkError);
                return interaction.editReply('My database brain froze! Pls try again later.');
            }

            if (existing) {
                return interaction.editReply('<:BearShock:1460381158134120529> That email is already verified!\n\nCheck our [Terms](https://brunov.juainny.com/terms) & [Privacy Policy](https://brunov.juainny.com/privacy) and see how we manage that information.');
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            // Save Pending Code
            const { error: upsertError } = await supabase
                .from('pending_codes')
                .upsert({
                    discord_id: discordUserId,
                    code,
                    email_hash: emailHash,
                    expires_at: expiresAt.toISOString(),
                }, { onConflict: 'discord_id' });

            if (upsertError) {
                console.error('[Bruno Error] Supabase Upsert Failed:', upsertError);
                throw upsertError;
            }

            // Send Styled Email
            console.log(`[Bruno Log] Sending email for User ${discordUserId}...`);
            const resendResponse = await resend.emails.send({
                from: 'Bruno Verifies <verify@brunov.juainny.com>',
                to: email,
                subject: 'Bruno\'s Secret Code for You',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #FDFBF7; border-radius: 20px; text-align: center;">
                      <h1 style="color: #591C0B; font-size: 28px;">Verification Time! 🐻</h1>
                      <p style="font-size: 16px; color: #4A3728;">Hi Brunonian! We got your discord command, grab this code to verify your acceptance and get that role!:</p>
                      
                      <div style="background: #FFF; border: 2px dashed #CE1126; padding: 20px; text-align: center; border-radius: 12px; font-size: 36px; font-weight: 800; letter-spacing: 5px; margin: 30px auto; color: #CE1126; max-width: 200px;">
                        ${code}
                      </div>
                      
                      <p style="color: #8C6B5D; font-size: 14px;">This code self-destructs (expires) in 10 minutes.</p>
                      <hr style="border: 0; border-top: 1px solid #CE1126; opacity: 0.2; margin: 30px 0;">
                      <p style="color: #8C6B5D; font-size: 12px;">
                        <a href="https://brunov.juainny.com/terms" style="color: #CE1126; text-decoration: none; font-weight: bold;">Terms</a> • <a href="https://brunov.juainny.com/privacy" style="color: #CE1126; text-decoration: none; font-weight: bold;">Privacy Policy</a> • We hashed your email to protect your identity.
                      </p>
                    </div>
                `
            });

            if (resendResponse.error) {
                console.error('[Bruno Error] Resend Failed:', resendResponse.error);
                throw resendResponse.error;
            }

            console.log(`[Bruno Log] Email successfully queued/sent. Resend ID: ${resendResponse.data?.id}`);
            await interaction.editReply('<:bearbear:1458612533492711434> I sent my pigeon friend to your **Brown email**! Please **check your inbox**. Then, use the `/confirm` command with the code I sent you.\n\nCheck our [Terms](https://brunov.juainny.com/terms) & [Privacy Policy](https://brunov.juainny.com/privacy)');
        } catch (err) {
            console.error('[Bruno Error] /verify handler exception:', err);
            await interaction.editReply('Error! My pigeons are on strike and my email was not sent. Try again later.');
        }
    }

    if (commandName === 'confirm') {
        await interaction.deferReply({ ephemeral: true });
        const code = options.getString('code');

        try {
            const { data: pending, error: fetchError } = await supabase
                .from('pending_codes')
                .select('*')
                .eq('discord_id', discordUserId)
                .eq('code', code)
                .single();

            if (fetchError || !pending) {
                console.warn(`[Bruno Warn] Invalid code attempt for User ${discordUserId}`);
                return interaction.editReply('Invalid code!');
            }

            // Assign Role
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordUserId);
            const roleId = process.env.DISCORD_ROLE_ID;

            if (!roleId) {
                console.error('[Bruno Error] DISCORD_ROLE_ID is missing');
                return interaction.editReply('I verified you, but I don\'t know what role to give! (Config Error, contact <@547599059024740374>)');
            }

            await member.roles.add(roleId);
            console.log(`[Bruno Log] Assigned role to ${discordUserId}`);

            // Persist Verification
            console.log(`[Bruno Log] Attempting to save verification for ${discordUserId}...`);
            const { error: insertError } = await supabase.from('verifications').insert({
                discord_id: discordUserId,
                email_hash: pending.email_hash,
                verification_method: 'command',
                verified_at: new Date().toISOString()
            });

            if (insertError) {
                console.error('[Bruno Error] Failed to log verification to DB:', insertError);
                return interaction.editReply('<:BearShock:1460381158134120529> I gave you the role, but my database brain is full! I couldn\'t save your record. Please let <@547599059024740374> know!');
            }

            console.log(`[Bruno Log] Saved verification for ${discordUserId} to Supabase.`);

            // Cleanup & Webhook
            await supabase.from('pending_codes').delete().eq('discord_id', discordUserId);

            // Fire Webhook
            await logToChannel(discordUserId, 'command');

            await interaction.editReply('<:Verified:1460379061816787139> You\'re verified, Bruno-approved, 100% bruninian, and ready to go!');
        } catch (err) {
            console.error('[Bruno Error] /confirm handler exception:', err);
            await interaction.editReply('Error assigning role. Yell at <@547599059024740374>!');
        }
    }
});

// Startup Test
(async () => {
    try {
        const { data, error } = await supabase.from('pending_codes').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('[Bruno Log] Supabase connectivity verified.');
    } catch (err) {
        console.error('[Bruno Error] Supabase test failed:', err.message);
    }
})();

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('CRITICAL ERROR: DISCORD_BOT_TOKEN is missing!');
    process.exit(1);
}

client.login(process.env.DISCORD_BOT_TOKEN);
