const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
require('dotenv').config();

// Determine the environment and load the corresponding config file
const environment = process.env.NODE_ENV || 'production';
const config = require(`./config.${ environment }.json`);
const version = require('./version.json');

client.once('ready', () => {
	// Send a message to the specified channel to indicate the bot is ready
	const labsChannel = client.channels.cache.get(config.labsChannelId);
	if (labsChannel) {
		labsChannel.send('ZIP is ready to observe. 👁️');
	} else {
		console.log(`Labs channel not found: ${ config.labsChannelId } 🔴`);
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

	if (message.content === '!version') {
		message.reply(`**Version**: ${ version.version } 👁️\n**Last updated**: ${ version.lastUpdated }`);
	}

	// Check if the message is in the labs channel and starts with "!send "
	if (message.channel.id === config.labsChannelId && message.content.startsWith('!send ')) {
		// Extract the message to send
		const contents = message.content.slice(6).trim();

		// Send the extracted message to the target channel
		const targetChannel = client.channels.cache.get(config.chatChannelId);
		if (targetChannel) {
			targetChannel.send(contents);
		} else {
			console.log(`Target channel not found: ${ config.chatChannelId } 🔴`);
		}
	}
});

// Login to Discord with your app's token from env file
client.login(process.env.BOT_TOKEN);