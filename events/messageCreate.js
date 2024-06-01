module.exports = {
	name: 'messageCreate',
	async execute(message, config) {
		// Ignore messages from bots
		if (message.author.bot) return;

		// Ignore if user is a moderator
		const moderatorRole = message.guild.roles.cache.get(config.roles.moderator);
		if (message.member.roles.cache.has(moderatorRole.id)) return;

		const inviteRegex = /https?:\/\/(www\.)?(canary\.|ptb\.)?discord(\.gg|\.com\/invite|app\.com\/invite)\/[a-zA-Z0-9]+|discord\.gg\/[a-zA-Z0-9]+|https?:\/\/(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]+/;

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
				const logChannel = message.guild.channels.cache.get(config.channels.log.id);
				if (logChannel) {
					logChannel.send(`[SYSTEM] **${ message.author.tag }** tried to send an invite link: \`${ message.content }\``);
				} else {
					console.log(`Log channel not found: ${ config.channels.log.id } 🔴`);
				}
			} catch (error) {
				console.error('Error deleting message:', error);
			}
		}
	},
};