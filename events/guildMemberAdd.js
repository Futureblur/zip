module.exports = {
	name: 'guildMemberAdd',
	execute(member, config) {
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

		// Get a random greeting message
		const greeting = getRandomGreeting();

		// Send the greeting message to a specific channel
		const channel = member.guild.channels.cache.get(config.chatChannelId);
		if (channel) {
			channel.send(`${ member.user } ${ greeting }`);
		}

		// Automatically assign a role to the new member
		const role = member.guild.roles.cache.get(config.memberRoleId);
		if (role) {
			member.roles.add(role).catch(console.error);
		}

		// Log the new member in the specified channel
		const logChannel = member.guild.channels.cache.get(config.logChannelId);
		if (logChannel) {
			logChannel.send(`[SYSTEM] **${ member.user.tag }** has joined the server.`);
		} else {
			console.log(`Log channel not found: ${ config.logChannelId } 🔴`);
		}
	}
};