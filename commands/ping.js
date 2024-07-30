const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping an endpoint to check its availability."),
  async execute(interaction) {
    const successEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "zipYes",
    );
    await interaction.reply(
      `${successEmoji} I'm alive, and all systems are operational.`,
    );
  },
};
