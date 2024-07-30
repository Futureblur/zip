module.exports = async function checkEmojis(guild, config, logChannel) {
  const emojisToCheck = [{ name: "zipYes" }, { name: "zipNo" }];

  let missingEmojis = false;

  emojisToCheck.forEach((emojiConfig) => {
    if (!guild) return;

    const emoji = guild.emojis.cache.find(
      (emoji) => emoji.name === emojiConfig.name,
    );
    if (!emoji) {
      logChannel.send(`[ERROR] Emoji "${emojiConfig.name}" not found.`);
      missingEmojis = true;
    }
  });

  return !missingEmojis;
};
