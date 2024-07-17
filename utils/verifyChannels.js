module.exports = async function checkChannels(guild, config, logChannel) {
  const channelsToCheck = [
    { id: config.channels.chat.id, name: "Chat" },
    { id: config.channels.log.id, name: "Log" },
    { id: config.channels.render.id, name: "Render" },
    { id: config.channels.introduce.id, name: "Introduce" },
    { id: config.channels.introduce.id, name: "Jobs" },
  ];

  let missingChannels = false;

  channelsToCheck.forEach((channelConfig) => {
    if (!guild) return;

    const channel = guild.channels.cache.get(channelConfig.id);
    if (!channel) {
      logChannel.send(
        `[ERROR] Channel "${channelConfig.name}" with ID ${channelConfig.id} not found.`,
      );
      missingChannels = true;
    }
  });

  return !missingChannels;
};
