const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user indefinitely and adds further restrictions.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to mute")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Format: User was muted, because they were [reason]")
        .setRequired(true),
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
    const logChannel = interaction.guild.channels.cache.get(
      config.channels.log.id,
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

    if (target.id === config.clientId) {
      // Log the attempt to mute the bot
      logChannel.send(`[SYSTEM] ${interaction.user.tag} tried to mute me.`);

      return interaction.reply({
        content: `${errorEmoji} I cannot mute myself. Do you want me to stop talking? 😔`,
        ephemeral: true,
      });
    }

    if (member.roles.cache.has(restrictedRole.id)) {
      return interaction.reply({
        content: `${errorEmoji} ${target.tag} is already restricted.`,
        ephemeral: true,
      });
    }

    const reason = interaction.options.getString("reason") || "none provided.";

    try {
      await member.roles.add(restrictedRole);
      await interaction.reply({
        content: `${successEmoji} ${target.tag} has been restricted, because they were ${reason}`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${errorEmoji} There was an error trying to restrict ${target.tag}.`,
        ephemeral: true,
      });
    }

    // DM the user who was restricted
    try {
      await target.send(
        `You have been restricted from **BLUR** 👁️, because you were ${reason} \n-# If you believe this was a mistake, please reach out to \`hello@futureblur.com\``,
      );
    } catch (error) {
      console.error(error);
    }

    // Log the restriction in the specified channel
    if (logChannel) {
      logChannel.send(
        `[SYSTEM] **${target.tag}** has been restricted by **${interaction.user.tag}**, because they were ${reason}`,
      );
    } else {
      console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
    }
  },
};
