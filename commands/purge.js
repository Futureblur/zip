const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription(
      "Deletes a specified number of messages or clears the entire channel.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option.setName("count").setDescription("Number of messages to delete"),
    ),
  async execute(interaction, config) {
    const count = interaction.options.getInteger("count");
    const channel = interaction.channel;
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

    await interaction.deferReply({ ephemeral: true });

    try {
      if (count) {
        if (count < 1 || count > 1024) {
          return interaction.editReply({
            content: `${errorEmoji} Please provide a number between 1 and 1024.`,
          });
        }

        await channel.bulkDelete(count, true);
        interaction.editReply({
          content: `${successEmoji} Successfully deleted **${count}** messages.`,
        });

        // Log the purge in the specified channel
        if (logChannel) {
          logChannel.send(
            `[SYSTEM] **${count}** messages have been deleted by **${interaction.user.tag}** in **${channel.name}**.`,
          );
        } else {
          console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
        }
      } else {
        // Purge the entire channel
        let fetched;
        do {
          fetched = await channel.messages.fetch({ limit: 100 });
          await channel.bulkDelete(fetched, true);
        } while (fetched.size >= 2); // Prevent infinite loop

        interaction.editReply({
          content: `${successEmoji} Channel has been cleared.`,
        });

        // Log the purge in the specified channel
        if (logChannel) {
          logChannel.send(
            `[SYSTEM] **${interaction.user.tag}** cleared **${channel.name}**.`,
          );
        } else {
          console.log(`Log channel not found: ${config.channels.log.id} 🔴`);
        }
      }
    } catch (error) {
      console.error(error);
      interaction.editReply({
        content: `${errorEmoji} An error occurred while trying to delete messages.`,
      });
    }
  },
};
