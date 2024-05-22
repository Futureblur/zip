module.exports = async function checkRoles(guild, config, logChannel) {
	const rolesToCheck = [
		{ id: config.moderatorRoleId, name: 'Moderator' },
		{ id: config.restrictedRoleId, name: 'Restricted' },
		{ id: config.memberRoleId, name: 'Member' },
	];

	let missingRoles = false;

	rolesToCheck.forEach(roleConfig => {
		if (!guild) return;

		const role = guild.roles.cache.get(roleConfig.id);
		if (!role) {
			logChannel.send(`[ERROR] Role "${ roleConfig.name }" with ID ${ roleConfig.id } not found.`);
			missingRoles = true;
		}
	});

	return !missingRoles;
};