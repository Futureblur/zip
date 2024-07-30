module.exports = {
  name: "interactionCreate",
  async execute(interaction, config) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    const errorEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "zipNo",
    );

    try {
      await command.execute(interaction, config);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${errorEmoji} An error occurred while executing this command.`,
        ephemeral: true,
      });
    }
  },
};
