module.exports = {
	name: 'guildMemberRemove',
	async execute(member, config) {
		const logChannelId = config.channels.log.id;
		const logChannel = member.guild.channels.cache.get(logChannelId);

		if (logChannel) {
			logChannel.send(`[SYSTEM] **${ member.user.tag }** has left the server. They'll be be missing out a lot.`);
		} else {
			console.log(`${ member.user.tag } has left the server, but the log channel was not found.`);
		}
	}
};