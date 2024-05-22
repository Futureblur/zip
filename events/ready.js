const verifyRoles = require('../utils/verifyRoles');
const verifyChannels = require('../utils/verifyChannels');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client, config) {
		// Set status to idle
		client.user.setStatus('idle');

		const labsChannel = client.channels.cache.get(config.channels.labs);
		if (!labsChannel) {
			return console.log(`Labs channel not found: ${ config.channels.labs } 🔴`);
		}

		const clientId = config.clientId;
		const guildId = config.guildId;

		const guild = client.guilds.cache.get(guildId);
		if (!guild) {
			labsChannel.send('[ERROR] Guild ID not found.');
		}

		if (clientId !== client.user.id) {
			labsChannel.send('[ERROR] Client ID does not match.');
		}

		const rolesStatus = await verifyRoles(guild, config, labsChannel);
		const channelsStatus = await verifyChannels(guild, config, labsChannel);

		if (rolesStatus && channelsStatus) {
			console.log('Configuration verified. ✅');
			labsChannel.send('ZIP is ready to observe. 👁️');
		} else {
			labsChannel.send("[CRITICAL] **Configuration verification failed. See messages above for details. Self-destructing in 3... 2... 1... 💥**");
		}
	}
};