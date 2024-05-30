const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yeet')
		.setDescription('Kicks a user from the server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user to kick')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for kicking the user')),
	async execute(interaction, config) {
		const target = interaction.options.getUser('target');
		const member = interaction.guild.members.cache.get(target.id);
		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);
		const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		if (target.id === config.clientId) {
			// Log the attempt to kick the bot
			logChannel.send(`[SYSTEM] ${ interaction.user.tag } tried to kick me.`);

			return interaction.reply({
				content: "I cannot kick myself. Do you want me to leave? 🤨",
				ephemeral: true
			});
		}

		if (!member.kickable) {
			return interaction.reply({ content: 'This user cannot be kicked.', ephemeral: true });
		}

		const reason = interaction.options.getString('reason') || 'none provided.';
		try {
			await member.kick(reason);
			await interaction.reply({ content: `${ target.tag } has been kicked. Reason: ${ reason }` });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while trying to kick the user.', ephemeral: true });
		}

		// DM the user who was kicked with the reason
		try {
			await target.send(`You have been kicked from **BLUR** 👁️for the following reason: ${ reason }`);
		} catch (error) {
			console.error(error);
		}

		// Log the kick in the specified channel
		if (logChannel) {
			logChannel.send(`[SYSTEM] **${ target.tag }** has been kicked by **${ interaction.user.tag }**. Reason: ${ reason }`);
		} else {
			console.log(`Log channel not found: ${ config.channels.log.id } 🔴`);
		}
	}
};