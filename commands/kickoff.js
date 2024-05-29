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
				.setDescription('Pre-intro audio source.')
				.setRequired(true)),
	async execute(interaction, config) {
		const link = interaction.options.getString('link');
		const member = await interaction.guild.members.fetch(interaction.user.id);
		const voiceChannel = member.voice.channel;

		const moderatorRole = interaction.guild.roles.cache.get(config.roles.moderator);
		const logChannel = interaction.guild.channels.cache.get(config.channels.log);

		if (!interaction.member.roles.cache.has(moderatorRole.id)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		if (!voiceChannel) {
			return interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });
		}

		// Validate the YouTube link
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
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
		});
	}
};
