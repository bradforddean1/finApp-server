const { NODE_ENV, DATABASE_URL_TEST, DATABASE_URL } = require("./config");
console.log(DATABASE_URL_TEST);
module.exports = {
	migrationsDirectory: "db/migrations",
	driver: "pg",
	connectionString: NODE_ENV === "test" ? DATABASE_URL_TEST : DATABASE_URL,
};
