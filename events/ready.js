const verifyRoles = require("../utils/verifyRoles");
const verifyChannels = require("../utils/verifyChannels");
const verifyEmojis = require("../utils/verifyEmojis");
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client, config) {
    const labsChannel = client.channels.cache.get(config.channels.labs.id);
    if (!labsChannel) {
      return console.log(
        `Labs channel not found: ${config.channels.labs.id} 🔴`,
      );
    }

    const clientId = config.clientId;
    const guildId = config.guildId;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      labsChannel.send("[ERROR] Guild ID not found.");
    }

    if (clientId !== client.user.id) {
      labsChannel.send("[ERROR] Client ID does not match.");
    }

    const rolesStatus = await verifyRoles(guild, config, labsChannel);
    const channelsStatus = await verifyChannels(guild, config, labsChannel);
    const emojisStatus = await verifyEmojis(guild, config, labsChannel);

    if (rolesStatus && channelsStatus && emojisStatus) {
      console.log("Configuration verified. ✅");
      labsChannel.send("ZIP is ready to observe. 👁️");
    } else {
      labsChannel.send(
        "[CRITICAL] **Configuration verification failed. See messages above for details. Self-destructing in 3... 2... 1... 💥**",
      );
    }
  },
};
