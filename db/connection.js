const knex = require("knex");
const { NODE_ENV, DB_URL, DB_URL_TEST } = require("../config/config");

const db = knex({
	client: "pg",
	connection: NODE_ENV === "test" ? DB_URL_TEST : DB_URL,
});

module.exports = db;
