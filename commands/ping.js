const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping an endpoint to check its availability.'),
	async execute(interaction) {
		await interaction.reply("I'm alive. 🟢");
	}
};