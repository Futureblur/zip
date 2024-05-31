const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('release')
		.setDescription('Rounds up the event by unlocking all channels.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction, config) {
		const memberRole = interaction.guild.roles.cache.get(config.roles.member);
		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		await interaction.deferReply();

		const publicChannels = Object.values(config.channels).filter(channel => channel.public);

		try {
			for (const channel of publicChannels) {
				const discordChannel = interaction.guild.channels.cache.get(channel.id);
				if (discordChannel) {
					await discordChannel.permissionOverwrites.edit(memberRole, {
						ViewChannel: true,
						SendMessages: true
					});
				}
			}

			await interaction.editReply({ content: '🎉 Thank you for attending the event. All channels are now open again.' });

			// Log the event
			const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);
			if (logChannel) {
				logChannel.send(`[SYSTEM] **${ interaction.user.tag }** ended the event.`);
			}
		} catch (error) {
			console.error('Error unlocking public channels:', error);
			await interaction.editReply({ content: 'An error occurred while unlocking the public channels.' });
		}
	}
};