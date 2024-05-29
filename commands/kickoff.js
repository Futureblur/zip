const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	VoiceConnectionStatus
} = require('@discordjs/voice');
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kickoff')
		.setDescription('Join a voice channel and play an audio file from a URL')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The URL of the audio file to play')
				.setRequired(true)),
	async execute(interaction, config) {
		const audioUrl = interaction.options.getString('url');
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

		await interaction.deferReply();

		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		const player = createAudioPlayer();

		connection.on(VoiceConnectionStatus.Ready, async () => {
			console.log('The bot has connected to the channel!');

			try {
				const resource = createAudioResource(audioUrl, { inputType: 2 });
				player.play(resource);
				connection.subscribe(player);

				player.on(AudioPlayerStatus.Idle, () => {
					connection.destroy();
				});

				await interaction.editReply({ content: `Now playing: ${ audioUrl }` });
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
