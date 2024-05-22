const version = require("../version.json");

module.exports = {
	name: 'messageCreate',
	execute(message, config) {
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
			const targetChannel = message.client.channels.cache.get(config.chatChannelId);
			if (targetChannel) {
				targetChannel.send(contents);
			} else {
				console.log(`Target channel not found: ${ config.chatChannelId } 🔴`);
			}
		}
	}
};