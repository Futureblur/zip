const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmutes a user.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user to unmute')
				.setRequired(true)),
	async execute(interaction, config) {
		const target = interaction.options.getUser('target');
		const member = interaction.guild.members.cache.get(target.id);
		const restrictedRole = interaction.guild.roles.cache.get(config.restrictedRoleId);
		const moderatorRole = interaction.guild.roles.cache.get(config.moderatorRoleId);

		if (!restrictedRole) {
			return interaction.reply({ content: 'Restricted role not found.', ephemeral: true });
		}

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		if (!member.roles.cache.has(restrictedRole.id)) {
			return interaction.reply({ content: 'This user is not restricted.', ephemeral: true });
		}

		try {
			await member.roles.remove(restrictedRole);
			await interaction.reply({ content: `${ target.tag } is no longer restricted. Welcome back. 🍹` });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while trying to unmute the user.', ephemeral: true });
		}
	}
};