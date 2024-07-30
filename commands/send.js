const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Sends a message to chat.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(true),
    ),
  async execute(interaction, config) {
    const member = interaction.member;
    const moderatorRole = config.roles.moderator;

    const errorEmoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "zipNo",
    );

    if (!member.roles.cache.has(moderatorRole)) {
      return interaction.reply({
        content: `${errorEmoji} You do not have permission to use this command.`,
        ephemeral: true,
      });
    }

    const messageContent = interaction.options.getString("message");
    const targetChannel = interaction.client.channels.cache.get(
      config.channels.chat.id,
    );

    if (targetChannel) {
      targetChannel.send(messageContent);
      await interaction.reply("Message sent.");
    } else {
      await interaction.reply(`${errorEmoji} Chat channel not found.`);
    }

    // Log the message in the specified channel
    const logChannel = interaction.guild.channels.cache.get(
      config.channels.log.id,
    );

    if (logChannel) {
      logChannel.send(
        `[SYSTEM] **${member.user.tag}** sent a message to chat.`,
      );
    } else {
      console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
    }
  },
};
