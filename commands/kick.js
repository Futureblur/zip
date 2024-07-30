const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yeet")
    .setDescription("Kicks a user from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to kick")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for kicking the user"),
    ),
  async execute(interaction, config) {
    const target = interaction.options.getUser("target");
    const member = interaction.guild.members.cache.get(target.id);
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

    if (!interaction.member.roles.cache.has(moderatorRole.id)) {
      return interaction.reply({
        content: `${errorEmoji} You do not have permission to use this command.`,
        ephemeral: true,
      });
    }

    if (target.id === config.clientId) {
      // Log the attempt to kick the bot
      logChannel.send(`[SYSTEM] **${interaction.user.tag}** tried to kick me.`);

      return interaction.reply({
        content: `${errorEmoji} I cannot kick myself. Do you want me to leave? 😔`,
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: `${errorEmoji} I cannot kick this user.`,
        ephemeral: true,
      });
    }

    const reason = interaction.options.getString("reason") || "none provided.";

    // DM the user who was kicked with the reason
    try {
      if (!member.user.bot) {
        await target.send(
          `You have been kicked from **BLUR** 👁️ for the following reason: ${reason}\n-# If you believe this was a mistake, reach out to \`hello@futureblur.com\``,
        );
      }
    } catch (error) {
      console.error(error);
    }

    try {
      await member.kick(reason);
      await interaction.reply({
        content: `${successEmoji} ${target.tag} has been kicked. Reason: ${reason}`,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${errorEmoji} There was an error trying to kick ${target.tag}.`,
        ephemeral: true,
      });
    }

    // Log the kick in the specified channel
    if (logChannel) {
      logChannel.send(
        `[SYSTEM] **${target.tag}** has been kicked by **${interaction.user.tag}**. Reason: ${reason}`,
      );
    } else {
      console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
    }
  },
};
