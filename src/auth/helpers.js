const bcrypt = require("bcryptjs");

function comparePass(userPassword, databasePassword) {
	return bcrypt.compareSync(userPassword, databasePassword);
}

function getHash(password) {
	const salt = bcrypt.genSaltSync();
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}

function loginRequired(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ status: "Please log in" });
	}
	return next();
}

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

//  npm install bcryptjs
