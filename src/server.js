// const knex = require("knex");
const app = require("./app");
const { PORT } = require("../config/config");
// const { DATABASE_URL } = require("../config/config");

// const db = knex({
//   client: "pg",
//   connection: DATABASE_URL,
// });

// app.set("db", db);

// Web Scoket
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
