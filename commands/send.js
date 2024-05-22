const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('send')
		.setDescription('Sends a message to chat.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message to send')
				.setRequired(true)),
	async execute(interaction, config) {
		const member = interaction.member;
		const moderatorRole = config.moderatorRoleId;

		if (!member.roles.cache.has(moderatorRole)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		const messageContent = interaction.options.getString('message');
		const targetChannel = interaction.client.channels.cache.get(config.chatChannelId);
		if (targetChannel) {
			targetChannel.send(messageContent);
			await interaction.reply('Message sent!');
		} else {
			await interaction.reply('Target channel not found.');
		}
	}
};