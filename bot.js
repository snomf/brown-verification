const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        activities: [{ name: 'Custom Status', state: 'Verifying Brown students and getting ready for IVY day, ROARRRRRRRRR! 🐻', type: 4 }],
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
        let methodText;
        if (method === 'command') {
            methodText = 'They have received their accepted role using the command.';
        } else if (method === 'admin') {
            methodText = 'They were manually verified by an Admin.';
        } else {
            methodText = 'They have received their accepted role using the website.';
        }

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
    if (interaction.isButton()) {
        const allowedRoles = ['1449820726407467190', '1442356190209380373'];
        const memberRoles = Array.isArray(interaction.member?.roles)
            ? interaction.member?.roles
            : (interaction.member?.roles?.cache ? interaction.member?.roles.cache.map(r => r.id) : []);
        const isAdmin = memberRoles.some(role => allowedRoles.includes(role));

        if (!isAdmin) {
            return interaction.reply({ content: 'You are not authorized to use these buttons.', ephemeral: true });
        }

        const customId = interaction.customId;
        if (!customId.startsWith('verify_')) return;

        await interaction.deferUpdate();

        const parts = customId.split('_');
        const action = parts[1]; // approve, deny, manual
        const targetId = parts[2];

        const { data: tempRecord } = await supabase.from('temp_verifications').select('*').eq('discord_id', targetId).single();
        if (!tempRecord || tempRecord.status !== 'pending') {
            return interaction.followUp({ content: 'This verification is no longer pending.', ephemeral: true });
        }

        const guild = await client.guilds.fetch(interaction.guildId);
        const targetMember = await guild.members.fetch(targetId).catch(() => null);

        let statusText = '';
        let color = 0x591C0B;

        if (action === 'approve') {
            if (targetMember) {
                await targetMember.roles.add(process.env.DISCORD_ROLE_ID).catch(console.error);
                await targetMember.send("✨ Your Ivy verification was **approved**! 🐻 You now have the accepted role! Once you get your Brown email, don't forget to fully verify on the website to get your **Certified Brunonian** role!").catch(() => { });
            }
            await supabase.from('temp_verifications').update({ status: 'mod_approved' }).eq('discord_id', targetId);
            statusText = `✅ APPROVED by ${interaction.user.tag}`;
            color = 0x00FF00;

        } else if (action === 'deny') {
            if (targetMember) {
                await targetMember.send("❌ Unfortunately, your uploaded verification was **denied**. Please make sure your screenshot clearly shows your acceptance to Brown University and try again, or wait to verify using your brown.edu email.").catch(() => { });
            }
            await supabase.from('temp_verifications').update({ status: 'denied' }).eq('discord_id', targetId);
            statusText = `❌ DENIED by ${interaction.user.tag}`;
            color = 0xFF0000;

        } else if (action === 'manual') {
            if (targetMember) {
                await targetMember.send("✉️ Our moderators couldn't fully verify your submission. A moderator will reach out to you shortly via DM to help! ROARRR").catch(() => { });
            }
            await supabase.from('temp_verifications').update({ status: 'needs_manual_dm' }).eq('discord_id', targetId);
            statusText = `⚠️ NEEDS MANUAL DM (Claimed by ${interaction.user.tag})`;
            color = 0xFFFF00;
        }

        // Update the embed and grey out ONLY the pressed button
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(color)
            .setTitle(`Ivy Verify Submission - ${statusText}`);

        const newRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`verify_approve_${targetId}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success)
                .setDisabled(action === 'approve'),
            new ButtonBuilder()
                .setCustomId(`verify_deny_${targetId}`)
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(action === 'deny'),
            new ButtonBuilder()
                .setCustomId(`verify_manual_${targetId}`)
                .setLabel('Needs Manual DM')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(action === 'manual')
        );

        await interaction.message.edit({ embeds: [embed], components: [newRow] });
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user, guildId } = interaction;
    const discordUserId = user.id;

    if (commandName === 'verify') {
        await interaction.deferReply({ ephemeral: true });

        // Constants
        const ALUMNI_PREFIX = '9';

        let email = options.getString('email')?.trim().toLowerCase();
        if (!email) return interaction.editReply('Sniff... you forgot to give me an email! Lets give that another try? <:bearbear:1458612533492711434>');

        if (!email.includes('@')) {
            email = `${email}@brown.edu`;
        }

        const isAlumni = email.endsWith('@alumni.brown.edu');
        const isStudent = email.endsWith('@brown.edu');

        if (!isStudent && !isAlumni) {
            return interaction.editReply('<:bearbear:1458612533492711434> Grr... that doesn\'t look like a **@brown.edu** or **@alumni.brown.edu** email! Are you really a brunonian? <:bearbear:1458612533492711434>');
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
                console.log(`[Bruno Log] User ${discordUserId} is already verified but is re-requesting a code to potentially update roles.`);
            }

            const isAlumni = email.includes('@alumni.brown.edu');

            // Code Generation Logic
            // Alumni Codes: 900000 - 999999
            // Standard Codes: 100000 - 899999
            let code;
            if (isAlumni) {
                code = Math.floor(900000 + Math.random() * 99999).toString();
            } else {
                code = Math.floor(100000 + Math.random() * 800000).toString();
            }

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
            await interaction.editReply('<:bearbear:1458612533492711434> I sent my pigeon friend to your **Brown email**! Please **check your inbox**. Then, use the `/confirm` command with the code I sent you.\n\n**💡 Tip:** Use the `class_year` option in `/confirm` to get your graduation roles!\n\nCheck our [Terms](https://brunov.juainny.com/terms) & [Privacy Policy](https://brunov.juainny.com/privacy)');
        } catch (err) {
            console.error('[Bruno Error] /verify handler exception:', err);
            await interaction.editReply('Error! My pigeons are on strike and my email was not sent. Try again later.');
        }
    }

    if (commandName === 'confirm') {
        await interaction.deferReply({ ephemeral: true });
        const code = options.getString('code');
        const classYear = options.getString('class_year'); // Optional

        // Role Constants
        const ROLES = {
            ALUMNI: '1449839054341410846',
            STUDENT: '1449839196671053895',
            ACCEPTED: process.env.DISCORD_ROLE_ID,
            CERTIFIED: process.env.DISCORD_CERTIFIED_ROLE_ID,
            '2029': '1449839285887963279',
            '2028': '1449839544877846561',
            '2027': '1449839612317925436',
            '2026': '1449839686435471381'
        };

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

            // Determine Roles
            const rolesToAssign = [];
            const isAlumniCode = code.startsWith('9');
            let successMsg = '';

            if (isAlumniCode) {
                rolesToAssign.push(ROLES.ALUMNI);
                successMsg = "Welcome back, Alumni! You've been verified.";
            } else {
                // Always add the base and certified role for email verification
                rolesToAssign.push(ROLES.ACCEPTED);
                rolesToAssign.push(ROLES.CERTIFIED);

                // Add Class Year if provided
                if (classYear === '2030') {
                    rolesToAssign.push(ROLES.STUDENT);
                    successMsg = "<:brunobear:1460379061816787139> Welcome, Class of '30! You've been verified and certified. ROARRRRRRRRR! 🐻";
                } else if (classYear && ROLES[classYear]) {
                    rolesToAssign.push(ROLES.STUDENT);
                    rolesToAssign.push(ROLES[classYear]);
                    successMsg = `<:brunobear:1460379061816787139> Welcome back, Class of '${classYear.slice(2)}! You've been verified and certified. 🐻`;
                } else {
                    successMsg = "You're verified, certified, Bruno-approved, and 100% brunonian! Welcome home! 🐻‍❄️✨";
                }
            }

            // Assign Roles
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordUserId);

            // Helper to add roles safely
            for (const rId of rolesToAssign) {
                if (rId) {
                    try {
                        await member.roles.add(rId);
                    } catch (e) {
                        console.error(`[Bruno Error] Failed to assign role ${rId}:`, e.message);
                    }
                }
            }

            console.log(`[Bruno Log] Assigned roles [${rolesToAssign.join(', ')}] to ${discordUserId}`);

            // Persist Verification
            // Determine Type for DB
            let verificationType = 'accepted';
            if (isAlumniCode) {
                verificationType = 'alumni';
            } else if (classYear && ROLES[classYear]) {
                verificationType = classYear;
            }

            console.log(`[Bruno Log] Attempting to save verification for ${discordUserId}...`);
            const { error: insertError } = await supabase.from('verifications').upsert({
                discord_id: discordUserId,
                email_hash: pending.email_hash,
                verification_method: 'command',
                verified_at: new Date().toISOString(),
                type: verificationType
            }, { onConflict: 'discord_id' });

            if (insertError) {
                console.error('[Bruno Error] Failed to log verification to DB:', insertError);
                return interaction.editReply('<:BearShock:1460381158134120529> I gave you the role, but my database brain is full! I couldn\'t save your record. Please let <@547599059024740374> know!');
            }

            console.log(`[Bruno Log] Saved verification for ${discordUserId} to Supabase.`);

            // Cleanup & Webhook
            await supabase.from('pending_codes').delete().eq('discord_id', discordUserId);

            // Fire Webhook
            await logToChannel(discordUserId, 'command');

            await interaction.editReply(`<:Verified:1460379061816787139> ${successMsg}`);
        } catch (err) {
            console.error('[Bruno Error] /confirm handler exception:', err);
            await interaction.editReply('Error assigning role. Yell at <@547599059024740374>!');
        }
    }

    if (commandName === 'adminv') {
        try {
            // Immediate Defer to prevent timeout
            await interaction.deferReply({ ephemeral: false });

            const allowedRoles = ['1449820726407467190', '1442356190209380373'];
            const rolesObj = interaction.member?.roles;
            // Handle both GuildMember (manager) and API (array)
            const memberRoles = Array.isArray(rolesObj)
                ? rolesObj
                : (rolesObj?.cache ? rolesObj.cache.map(r => r.id) : []);

            const hasPermission = memberRoles.some(role => allowedRoles.includes(role));

            if (!hasPermission) {
                return interaction.editReply('<:BearShock:1460381158134120529> Roar! You are not authorized to use this command.');
            }

            const targetUser = options.getUser('user');
            const verifyType = options.getString('type') || 'accepted';

            if (!targetUser) {
                return interaction.editReply('Please specify a user to verify.');
            }

            const targetUserId = targetUser.id;
            console.log(`[Bruno Log] Admin verify initiated for ${targetUserId} by ${interaction.user.tag} with type ${verifyType}`);

            const ROLES = {
                ALUMNI: '1449839054341410846',
                STUDENT: '1449839196671053895',
                ACCEPTED: process.env.DISCORD_ROLE_ID,
                CERTIFIED: process.env.DISCORD_CERTIFIED_ROLE_ID,
                '2029': '1449839285887963279',
                '2028': '1449839544877846561',
                '2027': '1449839612317925436',
                '2026': '1449839686435471381'
            };

            const rolesToAssign = [];
            let successDetail = '';

            if (verifyType === 'alumni') {
                rolesToAssign.push(ROLES.ALUMNI);
                successDetail = 'as **Alumni**';
            } else if (ROLES[verifyType]) {
                rolesToAssign.push(ROLES.ACCEPTED);
                rolesToAssign.push(ROLES.CERTIFIED);
                rolesToAssign.push(ROLES.STUDENT);
                rolesToAssign.push(ROLES[verifyType]);
                successDetail = `as **Class of '${verifyType.slice(2)}** (Certified)`;
            } else {
                rolesToAssign.push(ROLES.ACCEPTED);
                rolesToAssign.push(ROLES.CERTIFIED);
                successDetail = 'with **Accepted** and **Certified** roles';
            }

            // Force insert into Supabase
            const { error: dbError } = await supabase.from('verifications').upsert({
                discord_id: targetUserId,
                verification_method: 'admin',
                verified_at: new Date().toISOString(),
                email_hash: 'admin_bypass_' + targetUserId,
                type: verifyType
            }, { onConflict: 'discord_id' });

            if (dbError) {
                console.error('[Bruno Error] Admin Verify DB Error:', dbError);
                return interaction.editReply(`<:BearShock:1460381158134120529> Database error: ${dbError.message}`);
            }

            // Assign Roles
            const guild = await client.guilds.fetch(guildId);
            const memberToVerify = await guild.members.fetch(targetUserId);

            for (const rId of rolesToAssign) {
                if (rId) {
                    try {
                        await memberToVerify.roles.add(rId);
                    } catch (e) {
                        console.error(`[Bruno Error] Admin failed to assign role ${rId}:`, e.message);
                    }
                }
            }

            console.log(`[Bruno Log] Admin manually assigned roles [${rolesToAssign.join(', ')}] to ${targetUserId}`);

            await logToChannel(targetUserId, 'admin');

            await interaction.editReply(`<:Verified:1460379061816787139> **Success!** User <@${targetUserId}> has been forcibly verified ${successDetail}.`);
        } catch (err) {
            console.error('[Bruno Error] Admin Verify Exception:', err);
            // Check if we can still reply
            if (interaction.deferred) {
                await interaction.editReply(`<:BearShock:1460381158134120529> Failed to admin-verify: ${err.message}`);
            } else {
                await interaction.reply({ content: `<:BearShock:1460381158134120529> Failed to admin-verify: ${err.message}`, ephemeral: true }).catch(() => { });
            }
        }
    }

    if (commandName === 'ivy-verify') {
        await interaction.deferReply({ ephemeral: true });

        const attachment = options.getAttachment('attachment');
        const note = options.getString('note') || '';
        const forceTest = options.getString('force_test');

        const allowedRoles = ['1449820726407467190', '1442356190209380373'];
        const memberRoles = Array.isArray(interaction.member?.roles)
            ? interaction.member?.roles
            : (interaction.member?.roles?.cache ? interaction.member?.roles.cache.map(r => r.id) : []);
        const isAdmin = memberRoles.some(role => allowedRoles.includes(role));

        if (forceTest && !isAdmin) {
            return interaction.editReply('Only admins can use force_test.');
        }

        // Check if fully verified in DB
        const { data: isVerified } = await supabase.from('verifications').select('id').eq('discord_id', discordUserId).maybeSingle();
        if (isVerified && !forceTest) {
            return interaction.editReply('You are already fully verified! No need for a temporary pass.');
        }

        // Check for existing pending temp verification
        const { data: existingTemp } = await supabase.from('temp_verifications')
            .select('*')
            .eq('discord_id', discordUserId)
            .in('status', ['pending', 'auto_approved', 'mod_approved', 'needs_manual_dm'])
            .maybeSingle();

        if (existingTemp && !forceTest) {
            if (existingTemp.status === 'pending' || existingTemp.status === 'needs_manual_dm') {
                return interaction.editReply('Your verification is currently under review by our moderators! Please be patient.');
            } else {
                return interaction.editReply(`You already have an accepted pass! Use the website to fully verify with your Brown email when you get it.`);
            }
        }

        if (!attachment.contentType?.startsWith('image/')) {
            return interaction.editReply('Please upload an image file (png, jpg, etc).');
        }

        await interaction.editReply('Privacy notice: This image is processed by an automated OCR agent and only viewed by moderators in a private channel if manual review is needed. It is not permanently hosted by us.\n\n<:bearbear:1458612533492711434> Sniffing your acceptance letter... please wait...');

        let ocrText = '';
        let score = 0;

        if (forceTest === 'ocr_fail') {
            ocrText = 'bad unreadable text';
            score = 10;
        } else if (forceTest === 'auto_approve') {
            ocrText = 'Brown University Class of 2030 Congratulations Admitted';
            score = 100;
        } else if (forceTest === 'needs_review') {
            ocrText = 'Brown something something';
            score = 50;
        } else {
            try {
                const ocrRes = await fetch(`https://api.ocr.space/parse/imageurl?apikey=${process.env.OCR_SPACE_API_KEY}&url=${encodeURIComponent(attachment.url)}`);
                const ocrData = await ocrRes.json();
                if (ocrData && ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
                    ocrText = ocrData.ParsedResults[0].ParsedText || '';
                    const lowerText = ocrText.toLowerCase();
                    const keywords = ['brown', 'university', 'congratulations', 'admitted', 'accepted', 'class of 2030', 'welcome'];
                    let matched = 0;
                    keywords.forEach(kw => {
                        if (lowerText.includes(kw)) matched++;
                    });
                    score = Math.min(100, Math.round((matched / 5) * 100)); // Cap at 100, 5 keywords is 100%
                }
            } catch (err) {
                console.error('[Bruno Error] OCR failed:', err);
            }
        }

        const isApproved = score >= 70;
        const testPrefix = forceTest ? '**[TEST MODE]** ' : '';
        const expiresAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(); // 10 years (effectively permanent)

        if (isApproved) {
            // Auto approve
            if (!forceTest) {
                const guild = await client.guilds.fetch(guildId);
                const member = await guild.members.fetch(discordUserId);
                await member.roles.add(process.env.DISCORD_ROLE_ID).catch(console.error);
            }

            // Save to DB
            await supabase.from('temp_verifications').upsert({
                discord_id: discordUserId,
                status: 'auto_approved',
                score,
                expires_at: expiresAt
            }, { onConflict: 'discord_id' });

            const embed = new EmbedBuilder()
                .setTitle(`${testPrefix}New Ivy Verify Submission - AUTO APPROVED`)
                .setDescription(`User: <@${discordUserId}>\nScore: **${score}/100**\nExpires: ${new Date(expiresAt).toLocaleDateString()}\nNote: ${note || 'None'}`)
                .setColor(0x00FF00)
                .setThumbnail(attachment.url);

            const modChannel = await client.channels.fetch(process.env.MOD_REVIEW_CHANNEL_ID).catch(() => null);
            if (modChannel) await modChannel.send({ embeds: [embed] });

            return interaction.editReply(`${testPrefix}<:Verified:1460379061816787139> ROARRRRRR, I smell a Brunonian from a mile away! <:brunobear:1460379061816787139> You've been given the accepted role! 🐻 You will still need to fully verify via the website when you receive your @brown.edu email to get the **Certified Brunonian** status!`);
        } else {
            // Mod Review
            const embed = new EmbedBuilder()
                .setTitle(`${testPrefix}New Ivy Verify Submission - NEEDS REVIEW`)
                .setDescription(`User: <@${discordUserId}> (${discordUserId})\nScore: **${score}/100**\nNote: ${note || 'None'}\n\n**OCR Preview:**\n*${ocrText.substring(0, 200)}...*`)
                .setColor(0xFFA500)
                .setThumbnail(attachment.url);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`verify_approve_${discordUserId}`).setLabel('Approve').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`verify_deny_${discordUserId}`).setLabel('Deny').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`verify_manual_${discordUserId}`).setLabel('Needs Manual DM').setStyle(ButtonStyle.Secondary)
            );

            const modChannel = await client.channels.fetch(process.env.MOD_REVIEW_CHANNEL_ID).catch(() => null);
            let modMessageId = null;
            if (modChannel) {
                const modMsg = await modChannel.send({ embeds: [embed], components: [row] });
                modMessageId = modMsg.id;
            }

            await supabase.from('temp_verifications').upsert({
                discord_id: discordUserId,
                status: 'pending',
                score,
                mod_message_id: modMessageId,
                expires_at: expiresAt
            }, { onConflict: 'discord_id' });

            return interaction.editReply(`${testPrefix}ROARRRRRR, I couldn't automatically verify your letter, something about it makes me give it a score of **${score}**. 🧐 I've sent it to real brunonians to check. You'll get a DM shoRRRRRRRtly! 🐻‍❄️`);
        }
    }
});

// Expiry Role logic removed as per user request. Users keep the accepted role.

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
