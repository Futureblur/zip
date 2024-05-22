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

		if (target.id === config.clientId) {
			return interaction.reply({
				content: "I cannot mute myself. But I'll stop talking if that makes you happy. 😔",
				ephemeral: true
			});
		}

		if (member.roles.cache.has(restrictedRole.id)) {
			return interaction.reply({ content: 'This user is already restricted.', ephemeral: true });
		}

		try {
			await member.roles.add(restrictedRole);
			await interaction.reply({ content: `${ target.tag } has been restricted. Please shush. 🤫` });
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'An error occurred while trying to restrict the user.',
				ephemeral: true
			});
		}
	}
};
