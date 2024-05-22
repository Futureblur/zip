const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Determine the environment and load the corresponding config file
const environment = process.env.NODE_ENV || 'production';
const config = require(`./config.${ environment }.json`);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.events = new Collection();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${ file }`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, config));
	} else {
		client.on(event.name, (...args) => event.execute(...args, config));
	}
}

client.login(process.env.BOT_TOKEN);