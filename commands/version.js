const { SlashCommandBuilder } = require('@discordjs/builders');
const version = require('../version.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Check the current version.'),
	async execute(interaction) {
		await interaction.reply(`**Version**: ${ version.version } 👁️\n**Last updated**: ${ version.lastUpdated }`);
	}
};