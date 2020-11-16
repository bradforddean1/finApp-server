/**
 * Database service for authorization.
 * @module
 */

const db = require("../../db/connection");
const logger = require("../logger");

module.exports = {
	/**
	 * Add new row to users table
	 * @param {string} username
	 * @param {string} hash
	 * @returns {Promise} - Resovles with object contianing the new tbale row data.
	 * @throws {Error} - If knex query Promise rejects
	 */
	createUser: function (username, hash) {
		return db
			.insert({
				username: username,
				password: hash,
			})
			.into("users")
			.returning("*")
			.then((dbRes) => {
				logger.info(`new user ${username} added to database`);
				return dbRes;
			})
			.catch((err) => {
				logger.error(err);
				throw new Error(
					`DB_ERROR -- unexpected database error when adding ${username} to users`
				);
			});
	},

	/**
	 * Retrive database row for the users table for given username
	 * @param {string} username
	 * @returns {Promise} - Resovles with object contianing the requested table row data.
	 */
	findUserByUsername: function (username) {
		return db.select("*").from("users").where({ username }).first();
	},

	/**
	 * Retrive database row for the users table for given user id
	 * @param {string} id
	 * @returns {Promise} - Resovles with object contianing the requested table row data.
	 */
	findUserById: function (id) {
		return db.select("*").from("users").where({ id }).first();
	},
};
