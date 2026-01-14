require('dotenv').config({ path: '.env' });
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'verify',
        description: 'Start the verification process with your Brown email',
        options: [
            {
                name: 'email',
                description: 'Your @brown.edu email address',
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
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
