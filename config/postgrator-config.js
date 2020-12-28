// TODO
// This file partially duplicates the contents of `knexfile.js` (see comments there)
// It is used only by `npm run migrate`

const {
    DATABASE_URL,
    DATABASE_URL_TEST,
    NODE_ENV
} = require("./config");

module.exports = {
  connectionString: NODE_ENV === "test" ? DATABASE_URL_TEST : DATABASE_URL,
  driver: "pg",
	migrationDirectory: "db/migrations"
};
