module.exports = async function checkRoles(guild, config, logChannel) {
  const rolesToCheck = [
    { id: config.roles.moderator, name: "Moderator" },
    { id: config.roles.restricted, name: "Restricted" },
    { id: config.roles.member, name: "Member" },
    { id: config.roles.jobHunters, name: "Job Hunters" },
  ];

  let missingRoles = false;

  rolesToCheck.forEach((roleConfig) => {
    if (!guild) return;

    const role = guild.roles.cache.get(roleConfig.id);
    if (!role) {
      logChannel.send(
        `[ERROR] Role "${roleConfig.name}" with ID ${roleConfig.id} not found.`,
      );
      missingRoles = true;
    }
  });

  return !missingRoles;
};
