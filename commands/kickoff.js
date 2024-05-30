const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus
} = require('@discordjs/voice');
const play = require('play-dl');
const sodium = require('libsodium-wrappers');
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kickoff')
		.setDescription('Start a special event.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addStringOption(option =>
			option.setName('link')
				.setDescription('Pre-intro audio source. (obsolete)')
				.setRequired(false)),
	async execute(interaction, config) {
		const link = interaction.options.getString('link');
		const member = await interaction.guild.members.fetch(interaction.user.id);
		const voiceChannel = member.voice.channel;

		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);
		const memberRole = interaction.guild.roles.cache.get(config.roles.member);
		const logChannel = interaction.guild.channels.cache.get(config.channels.log.id);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		if (!voiceChannel) {
			return interaction.reply({ content: 'You need to join a voice channel first.', ephemeral: true });
		}

		// Validate the YouTube link
		/*const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
		if (!youtubeRegex.test(link)) {
			return interaction.reply({ content: 'Please provide a valid YouTube link.', ephemeral: true });
		}

		await interaction.deferReply();

		// Initialize sodium
		await sodium.ready;

		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		const player = createAudioPlayer();

		connection.on(VoiceConnectionStatus.Ready, async () => {
			console.log('The bot has connected to the channel!');
			try {
				// In highest quality
				const stream = await play.stream(link, { filter: 'audio' });
				const resource = createAudioResource(stream.stream, {
					inputType: stream.type,
				});

				player.play(resource);
				connection.subscribe(player);

				player.on(AudioPlayerStatus.Idle, () => {
					connection.destroy();
				});

				if (logChannel) {
					logChannel.send(`[SYSTEM] **${ interaction.user.tag }** started a special event.`);
				}

				await interaction.editReply({ content: `Event started.` });
			} catch (error) {
				console.error('Error while trying to play the audio:', error);
				await interaction.editReply({ content: 'An error occurred while trying to play the audio.' });
				connection.destroy();
			}
		});

		connection.on(VoiceConnectionStatus.Disconnected, () => {
			connection.destroy();
		});

		player.on('error', error => {
			console.error('Error in audio player:', error);
			connection.destroy();
		});*/

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

			const vc = interaction.guild.channels.cache.get(config.vc.stage.id);
			if (vc) {
				await vc.permissionOverwrites.edit(memberRole, {
					ViewChannel: true,
					Connect: true
				});
			}

			const stage1 = interaction.guild.channels.cache.get(config.channels.stage1.id);
			if (stage1) {
				await stage1.permissionOverwrites.edit(memberRole, {
					ViewChannel: true,
					SendMessages: true
				});

				stage1.send("🍿 Opening the curtains soon. Get your snacks ready.");
			}

			await interaction.editReply({ content: `🔒 **All** channels have been locked. The fun begins in <#${ config.channels.stage1.id }>.` });

			if (logChannel) {
				logChannel.send(`[SYSTEM] **${ interaction.user.tag }** started a special event.`);
			}
		} catch (error) {
			console.error('Error locking public channels:', error);
			await interaction.editReply({ content: 'An error occurred while locking the public channels.' });
		}
	}
};
