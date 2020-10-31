const db = require("../../db/connection");

module.exports = {
	createUser: function (username, hash) {
		return db
			.insert({
				username: username,
				password: hash,
			})
			.into("users")
			.returning("*");
	},
	findUserByUsername: function (username) {
		console.log("find by username: ", { username });
		return db.select("*").from("users").where({ username }).first();
	},
	findUserById: function (id) {
		console.log("find by id: ", id);
		return db.select("*").from("users").where({ id }).first();
	},
};
