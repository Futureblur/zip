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

			const vc = interaction.guild.channels.cache.get(config.vc.stage.id);
			if (vc) {
				await vc.permissionOverwrites.edit(memberRole, {
					ViewChannel: false,
					Connect: false
				});
			}

			const stage1 = interaction.guild.channels.cache.get(config.channels.stage1.id);
			if (stage1) {
				await stage1.permissionOverwrites.edit(memberRole, {
					ViewChannel: false,
					SendMessages: false
				});

				stage1.send("👋 The show is over. Thanks for stopping by.");
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