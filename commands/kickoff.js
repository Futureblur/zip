const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kickoff')
		.setDescription('Start a special event.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addStringOption(option =>
			option.setName('link')
				.setDescription('Event video link.')
				.setRequired(true)),
	async execute(interaction, config) {
		const link = interaction.options.getString('link');

		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);
		const memberRole = interaction.guild.roles.cache.get(config.roles.member);
		const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		// Validate youtube link
		if (!link.match(/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/)) {
			return interaction.reply({ content: 'Invalid YouTube link.', ephemeral: true });
		}

		await interaction.deferReply();

		const publicChannels = Object.values(config.channels).filter(channel => channel.public);

		try {
			for (const channel of publicChannels) {
				const discordChannel = interaction.guild.channels.cache.get(channel.id);

				if (discordChannel) {
					await discordChannel.permissionOverwrites.edit(memberRole, {
						SendMessages: false
					});

					if (channel.id !== config.channels.chat.id) {
						await discordChannel.permissionOverwrites.edit(memberRole, {
							ViewChannel: false
						});
					}
				}
			}

			// Reply with link but no embed
			await interaction.editReply({ content: `🔒 All channels have been locked. The fun begins **[here](<${ link }>)**.` });

			if (logChannel) {
				logChannel.send(`[SYSTEM] **${ interaction.user.tag }** started a special event.`);
			}
		} catch (error) {
			console.error('Error locking public channels:', error);
			await interaction.editReply({ content: 'An error occurred while locking the public channels.' });
		}
	}
};
