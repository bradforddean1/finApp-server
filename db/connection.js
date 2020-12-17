/**
 * DB connection
 * @module
 */

const knex = require("knex");
const {
	NODE_ENV,
	DATABASE_URL,
	DATABASE_URL_TEST,
} = require("../config/config");

/**
 * Knex database connection - returns connection to test/live database
 * based on production environment.
 */
const db = knex({
	client: "pg",
	connection: NODE_ENV === "test" ? DATABASE_URL_TEST : DATABASE_URL,
});

module.exports = db;
