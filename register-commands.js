require('dotenv').config({ path: '.env' });
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'verify',
        description: 'Start the verification process with your Brown email',
        options: [
            {
                name: 'email',
                description: 'Your @brown.edu or @alumni.brown.edu email',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
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
        description: 'Provisional check for recent admits using an acceptance letter screenshot',
        options: [
            {
                name: 'attachment',
                description: 'Screenshot or photo of your acceptance portal/letter',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            },
            {
                name: 'note',
                description: 'Optional short note for moderators (max 150 chars)',
                type: ApplicationCommandOptionType.String,
                required: false,
                max_length: 150,
            },
            {
                name: 'force_test',
                description: 'Admin Only Test Mode',
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: 'Auto Approve', value: 'auto_approve' },
                    { name: 'Needs Review', value: 'needs_review' },
                    { name: 'OCR Fail', value: 'ocr_fail' }
                ]
            }
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        if (process.env.DISCORD_GUILD_ID) {
            console.log(`Registering commands to Guild: ${process.env.DISCORD_GUILD_ID}`);
            await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
                { body: commands },
            );
        } else {
            console.log('Registering global commands...');
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
