const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");
const verifyRoles = require("../utils/verifyRoles");
const verifyChannels = require("../utils/verifyChannels");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Manually verify the configuration.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, config) {
    const guild = interaction.guild;
    const logChannel = guild.channels.cache.get(config.channels.log.id);

    const successEmoji = guild.emojis.cache.find(
      (emoji) => emoji.name === "zipYes",
    );

    const errorEmoji = guild.emojis.cache.find(
      (emoji) => emoji.name === "zipNo",
    );

    if (!logChannel) {
      return interaction.reply(`${errorEmoji} Log channel not found.`);
    }

    await verifyRoles(guild, config, logChannel);
    await verifyChannels(guild, config, logChannel);

    await interaction.reply(`${successEmoji} Configuration verified.`);
  },
};
