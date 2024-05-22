module.exports = {
	name: 'ready',
	once: true,
	execute(client, config) {
		console.log(config);
		// Set status to idle
		client.user.setStatus('idle');

		// Send a message to the specified channel to indicate the bot is ready
		const labsChannel = client.channels.cache.get(config.labsChannelId);
		if (labsChannel) {
			labsChannel.send('ZIP is ready to observe. 👁️');
		} else {
			console.log(`Labs channel not found: ${ config.labsChannelId } 🔴`);
		}
	}
};