const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Determine the environment and load the corresponding config file
const environment = process.env.NODE_ENV || 'production';
const config = require(`./config.${ environment }.json`);

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${ file }`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId), // Use Routes.applicationCommands(clientId) for global commands
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();