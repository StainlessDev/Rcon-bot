import dotenv from 'dotenv';
import Rcon from 'rcon-ts';
import { Client, GatewayIntentBits,  REST, Routes, ApplicationCommandOptionType,} from 'discord.js';
import { checkIgn } from './utils/ign-check';
require('dotenv').config() // Load .env file

let token = process.env.TOKEN; // Get the token from the environment

let client = new Client({ // Create a new client instance
    intents: [ // Define the intents we want to use
        GatewayIntentBits.Guilds
    ]
});

if(process.env.RCON_PASSWORD === undefined) {
    console.error('RCON_PASSWORD is not defined in .env');
}


const rcon = new Rcon({
    host: `${process.env.RCON_IP}`,
    port: parseInt(process.env.RCON_PORT as string),
    password: process.env.RCON_PASSWORD as string 
});


const commands = [
    {
      name: 'whitelist',
      description: 'WhiteList a user on the server',
      options: [
        {
          name: 'username',
          description: 'The user to whitelist',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ];

rcon.connect().then(() => {
    console.log('Connected to RCON');
}).catch((err) => {
    console.error('Failed to connect to RCON', err);
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

const rest = new REST({ version: '10' }).setToken(`${token}`);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(`${process.env.CLIENTID}`), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'whitelist') {
        
        const username = interaction.options.getString('username');

        if(!username) {
            await interaction.reply('Please provide a username');
            return;
        } 
        checkIgn(username).then((res) => {
            rcon.send(`whitelist add ${username}`).then((res) => {
            interaction.reply(`${username} has been whitelisted`);
        }).catch((err) => {
            interaction.reply('Failed to whitelist user');
        }); 
        }).catch((err) => {
            interaction.reply('INVALID USERNAME');
        });
    }
});



client.login(token);



