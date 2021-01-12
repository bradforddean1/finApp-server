const bcrypt = require("bcryptjs");

/**
 * Compare user pasword against hash stored in database.
 * @param {String} userPassword
 * @param {String} databasePassword
 * @returns {boolean} - True if login credentials match.
 */
function comparePass(userPassword, databasePassword) {
	return bcrypt.compareSync(userPassword, databasePassword);
}

/**
 * Hashes password
 * @param {string} password
 * @returns {string} - Hashed password
 */
function getHash(password) {
	const salt = bcrypt.genSaltSync();
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}

module.exports = {
	comparePass,
	getHash,
};
