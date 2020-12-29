const bcrypt = require("bcryptjs");

exports.seed = function (knex) {
	// Deletes ALL existing entries
	return knex("users")
		.del()
		.then(function () {
			const salt = bcrypt.genSaltSync();
			// Inserts seed entries
			return knex("users").insert([
				{
					username: "demo",
					password: bcrypt.hashSync("testing123", salt),
					created_at: new Date().toUTCString(),
				},
			]);
		});
};
