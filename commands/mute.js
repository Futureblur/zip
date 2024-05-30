const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mutes a user indefinitely.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user to mute')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for muting the user')),
	async execute(interaction, config) {
		const target = interaction.options.getUser('target');
		const member = interaction.guild.members.cache.get(target.id);
		const restrictedRole = interaction.guild.roles.cache.get(config.roles.restricted);
		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);
		const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);

		if (!restrictedRole) {
			return interaction.reply({ content: 'Restricted role not found.', ephemeral: true });
		}

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		if (target.id === config.clientId) {
			// Log the attempt to mute the bot
			logChannel.send(`[SYSTEM] ${ interaction.user.tag } tried to mute me.`);

			return interaction.reply({
				content: "I cannot mute myself. But I'll stop talking if that makes you happy. 😔",
				ephemeral: true
			});
		}

		if (member.roles.cache.has(restrictedRole.id)) {
			return interaction.reply({ content: 'This user is already restricted.', ephemeral: true });
		}

		const reason = interaction.options.getString('reason') || 'none provided.';

		try {
			await member.roles.add(restrictedRole);
			await interaction.reply({ content: `${ target.tag } has been restricted. Please shush. 🤫 Reason: ${ reason }` });
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'An error occurred while trying to restrict the user.',
				ephemeral: true
			});
		}

		// DM the user who was restricted
		try {
			await target.send(`You have been restricted from **BLUR** 👁️. Reason: ${ reason }\nPlease contact the moderators if you think this was a mistake.`);
		} catch (error) {
			console.error(error);
		}

		// Log the restriction in the specified channel
		if (logChannel) {
			logChannel.send(`[SYSTEM] **${ target.tag }** has been restricted by **${ interaction.user.tag }**. Reason: ${ reason }`);
		} else {
			console.log(`Log channel not found: ${ config.channels.log.id } 🔴`);
		}
	}
};
