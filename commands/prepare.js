const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prepare')
		.setDescription('Unhides event channels for preparation.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction, config) {
		const memberRole = interaction.guild.roles.cache.get(config.roles.member);
		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		await interaction.deferReply();

		const vc = interaction.guild.channels.cache.get(config.vc.stage.id);
		if (vc) {
			await vc.permissionOverwrites.edit(memberRole, {
				ViewChannel: true,
				Connect: false
			});
		}

		const stage1 = interaction.guild.channels.cache.get(config.channels.stage1.id);
		if (stage1) {
			await stage1.permissionOverwrites.edit(memberRole, {
				ViewChannel: true,
				SendMessages: false
			});
		}

		await interaction.editReply({ content: '🧹 Clearing the stage for a special event night.' });

		// Log the event
		const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);
		if (logChannel) {
			logChannel.send(`[SYSTEM] **${ interaction.user.tag }** started preparing the event.`);
		}
	}
};