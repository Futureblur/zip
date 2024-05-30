module.exports = async function checkChannels(guild, config, logChannel) {
	const channelsToCheck = [
		{ id: config.channels.chat.id, name: 'Chat' },
		{ id: config.channels.log.id, name: 'Log' },
	];

	let missingChannels = false;

	channelsToCheck.forEach(channelConfig => {
		if (!guild) return;

		const channel = guild.channels.cache.get(channelConfig.id);
		if (!channel) {
			logChannel.send(`[ERROR] Channel "${ channelConfig.name }" with ID ${ channelConfig.id } not found.`);
			missingChannels = true;
		}
	});

	return !missingChannels;
};