const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jobs")
    .setDescription("Manage job notifications")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subscribe")
        .setDescription("Subscribe to job notifications"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unsubscribe")
        .setDescription("Unsubscribe from job notifications"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("submit").setDescription("Post a job"),
    ),
  async execute(interaction, config) {
    const role = interaction.guild.roles.cache.get(config.roles.jobHunters);
    const jobsChannel = config.channels.jobs.id;
    const subcommand = interaction.options.getSubcommand();

    if (!role) {
      return interaction.reply({
        content: "Job Hunters role not found.",
        ephemeral: true,
      });
    }

    if (subcommand === "subscribe") {
      if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: "You are already subscribed to job notifications.",
          ephemeral: true,
        });
      }
      await interaction.member.roles.add(role);
      return interaction.reply({
        content: `Subscribed. You'll see new listings in <#${jobsChannel}>.`,
        ephemeral: true,
      });
    }

    if (subcommand === "unsubscribe") {
      if (!interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({
          content: "You are not subscribed to job notifications.",
          ephemeral: true,
        });
      }
      await interaction.member.roles.remove(role);
      return interaction.reply({
        content: "You have been unsubscribed from job notifications.",
        ephemeral: true,
      });
    }

    if (subcommand === "submit") {
      return interaction.reply({
        content:
          "Visit **[jobs.futureblur.com](https://jobs.futureblur.com)** to submit a new job post.",
        ephemeral: true,
      });
    }
  },
};
