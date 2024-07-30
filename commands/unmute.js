const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user and removes all restrictions.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to unmute")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Format: User was unmuted, because [reason]"),
    ),
  async execute(interaction, config) {
    const target = interaction.options.getUser("target");
    const member = interaction.guild.members.cache.get(target.id);
    const restrictedRole = interaction.guild.roles.cache.get(
      config.roles.restricted,
    );
    const moderatorRole = interaction.guild.roles.cache.get(
      config.roles.moderator,
    );

    const successEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "zipYes",
    );

    const errorEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "zipNo",
    );

    if (!restrictedRole) {
      return interaction.reply({
        content: `${errorEmoji} Restricted role not found.`,
        ephemeral: true,
      });
    }

    if (!interaction.member.roles.cache.has(moderatorRole.id)) {
      return interaction.reply({
        content: `${errorEmoji} You do not have permission to use this command.`,
        ephemeral: true,
      });
    }

    if (!member.roles.cache.has(restrictedRole.id)) {
      return interaction.reply({
        content: `${errorEmoji} ${target.tag} is not restricted.`,
        ephemeral: true,
      });
    }

    const reason = interaction.options.getString("reason") || "none provided.";

    try {
      await member.roles.remove(restrictedRole);
      await interaction.reply({
        content: `${successEmoji} ${target.tag} is no longer restricted, because ${reason}\n Welcome back. 🍹`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${errorEmoji} An error occurred trying to unmute ${target.tag}.`,
        ephemeral: true,
      });
    }

    // DM the user who was unrestricted
    try {
      await target.send(
        `You have been unrestricted from **BLUR** 👁️. Welcome back. 🍹`,
      );
    } catch (error) {
      console.error(error);
    }

    // Log the unrestrict in the specified channel
    const logChannel = interaction.guild.channels.cache.get(
      config.channels.log.id,
    );
    if (logChannel) {
      logChannel.send(
        `[SYSTEM] **${target.tag}** has been unrestricted by **${interaction.user.tag}**, because ${reason}`,
      );
    } else {
      console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
    }
  },
};
