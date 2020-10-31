require("dotenv").config();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_URL = process.env.DB_URL || "postgresql://finapp@localhost/finapp";
const DB_URL_TEST =
	process.env.DB_URL_TEST || "postgresql://finapp_test@localhost/finapp_test";
const GOOGLE_KEYS = {
	clientID: "your_client_ID",
	clientSecret: "your_client_secret",
};
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
const US_FUNDAMENTALS_API_KEY = process.env.US_FUNDAMENTALS_API_KEY;

module.exports = {
	NODE_ENV,
	PORT,
	DB_URL,
	DB_URL_TEST,
	GOOGLE_KEYS,
	SESSION_SECRET_KEY,
};
