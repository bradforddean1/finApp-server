const bcrypt = require("bcryptjs");

/**
 * Compare user pasword against hash stored in database.
 * @param {String} userPassword
 * @param {String} databasePassword
 * @returns {boolean} - True if login credentials match.
 */
function comparePass(userPassword, databasePassword) {
	console.log("LOGIN: ", bcrypt.compareSync(userPassword, databasePassword));
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

/**
 * Check if user is logged in: Sends an express response with 401 status if req
 * object does not have valid logged in user.  Runs next() if logged in.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function loginRequired(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ status: "Please log in" });
	}
	return next();
}

/**
 * Check if user is logged in: Sends an express response with 401 stats if req does
 * have valid logged in user.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function loginRedirect(req, res, next) {
	if (req.user) {
		return res.status(401).json({ status: "You are already logged in" });
	}
	return next();
}

module.exports = {
	comparePass,
	getHash,
	loginRequired,
	loginRedirect,
};
