module.exports = {
	name: 'messageCreate',
	async execute(message, config) {
		// Ignore messages from bots
		if (message.author.bot) return;

		// Regular expression to match Discord invite links
		const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]+/;

		// Check if the message contains a Discord invite link
		if (inviteRegex.test(message.content)) {
			try {
				// Delete the message
				await message.delete();

				// Optionally, send a warning to the user
				message.channel.send(`${ message.author } don't send invite links, please. ⚠️`).then(msg => {
					setTimeout(() => msg.delete(), 5000); // Delete the warning message after 5 seconds
				});

				// Optionally, log the deletion in a channel with the invite link
				const logChannel = message.guild.channels.cache.get(config.channels.log);
				if (logChannel) {
					logChannel.send(`[SYSTEM] **${ message.author.tag }** tried to send an invite link: \`${ message.content }\``);
				} else {
					console.log(`Log channel not found: ${ config.channels.log } 🔴`);
				}
			} catch (error) {
				console.error('Error deleting message:', error);
			}
		}
	},
};