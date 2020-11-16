/**
 * DB connection
 * @module
 */

const knex = require("knex");
const { NODE_ENV, DB_URL, DB_URL_TEST } = require("../config/config");

/**
 * Knex database connection - returns connection to test/live database
 * based on production environment.
 */
const db = knex({
	client: "pg",
	connection: NODE_ENV === "test" ? DB_URL_TEST : DB_URL,
});

module.exports = db;
