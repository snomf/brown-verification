const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const { getServerConfig } = require('./lib/config');

const commands = [
    {
        name: 'verify',
        description: 'Start the verification process (Email or Google)',
    },
    {
        name: 'confirm',
        description: 'Confirm your verification with the 6-digit code',
        options: [
            {
                name: 'code',
                description: 'The 6-digit code sent to your email',
                type: ApplicationCommandOptionType.String,
                required: true,
                max_length: 6,
                min_length: 6,
            },
            {
                name: 'class_year',
                description: 'Optional: Select your class year (Current Students)',
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: "Class of '30 (Default)", value: "2030" },
                    { name: "Class of '26", value: "2026" },
                    { name: "Class of '27", value: "2027" },
                    { name: "Class of '28", value: "2028" },
                    { name: "Class of '29", value: "2029" },
                ]
            },
        ],
    },
    {
        name: 'adminv',
        description: 'Admin: Force verify a user (Bypass email)',
        options: [
            {
                name: 'user',
                description: 'The user to force verify',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'type',
                description: 'Optional: Select the verification type',
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: 'Accepted (Default)', value: 'accepted' },
                    { name: 'Alumni', value: 'alumni' },
                    { name: "Class of '30", value: "2030" },
                    { name: "Class of '26", value: "2026" },
                    { name: "Class of '27", value: "2027" },
                    { name: "Class of '28", value: "2028" },
                    { name: "Class of '29", value: "2029" },
                ]
            }
        ],
    },
    {
        name: 'ivy-verify',
        description: 'Check for recent admits using an acceptance letter screenshot (Recommended: Include your name!)',
        options: [
            {
                name: 'attachment',
                description: 'Screenshot or photo of your acceptance portal/letter (Must show your name!)',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            },
            {
                name: 'note',
                description: 'Optional short note for moderators (max 150 chars)',
                type: ApplicationCommandOptionType.String,
                required: false,
                max_length: 150,
            }
        ],
    },
    {
        name: 'manage',
        description: 'Management commands (Bot status, reminders, etc.)',
        options: [
            {
                name: 'action',
                description: 'What do you want to do?',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: 'Update Status (Pop-up Form)', value: 'status' },
                    { name: 'Send Reminder', value: 'remind' },
                ]
            },
            {
                name: 'user',
                description: 'Target user (Only for Send Reminder)',
                type: ApplicationCommandOptionType.User,
                required: false,
            }
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const settings = await getServerConfig();
        const clientId = process.env.DISCORD_CLIENT_ID || settings.botId;
        const guildId = process.env.DISCORD_GUILD_ID || settings.guildId;

        if (!clientId) throw new Error("DISCORD_CLIENT_ID (or bot_id in Supabase) is missing!");

        // 1. ALWAYS clear global commands first to resolve duplicates
        console.log('Cleaning up global commands (this prevents duplicates)...');
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );

        if (guildId) {
            // 2. Register to specific guild for instant updates
            console.log(`Registering commands to Guild: ${guildId}`);
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
        } else {
            // 3. Register globally (takes ~1 hour to propagate)
            console.log('Registering global commands (no guild ID found)...');
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
