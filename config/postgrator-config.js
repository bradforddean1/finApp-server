const { NODE_ENV, DB_URL_TEST, DB_URL } = require("./config");
console.log(DB_URL_TEST);
module.exports = {
	migrationsDirectory: "db/migrations",
	driver: "pg",
	connectionString: NODE_ENV === "test" ? DB_URL_TEST : DB_URL,
};
