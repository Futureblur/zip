const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
require('dotenv').config();

// Determine the environment and load the corresponding config file
const environment = process.env.NODE_ENV || 'production';
const config = require(`./config.${ environment }.json`);

client.once('ready', () => {
    // Send a message to the specified channel to indicate the bot is ready
    const sandboxChannel = client.channels.cache.get(config.sandboxChannelId);
    if (sandboxChannel) {
        sandboxChannel.send('ZIP is ready to observe. 👁️');
    } else {
        console.log(`Sandbox channel not found: ${ config.readyMessageChannelId } 🔴`);
    }
});

// List of greeting messages
const greetings = [
    "yoo, what's poppin",
    "happy to have you here!",
    "welcome to the club 🎊",
    "you made it, welcome!",
    "a warm welcome from everyone.",
    "hey hey, feel free to introduce yourself!",
    "yoo",
];

// Function to get a random greeting message
function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
}

// Listen for new members joining the server
client.on('guildMemberAdd', member => {
    // Get a random greeting message
    const greeting = getRandomGreeting();

    // Send the greeting message to a specific channel
    // Replace 'channel-id-here' with the ID of the channel where you want to send the message
    const channel = member.guild.channels.cache.get(config.chatChannelId);
    if (channel) {
        channel.send(`${ member.user } ${ greeting }`);
    }

    // Automatically assign a role to the new member
    // Replace 'role-id-here' with the ID of the role you want to assign
    const role = member.guild.roles.cache.get(config.memberRoleId);
    if (role) {
        member.roles.add(role).catch(console.error);
    }
});

// Ping command
client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.reply('Pong. 🏓');
    }
});

// Login to Discord with your app's token from env file
client.login(process.env.BOT_TOKEN);