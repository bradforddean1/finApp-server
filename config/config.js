require("dotenv").config();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const DATABASE_URL =
	process.env.DATABASE_URL || "postgresql://finapp@localhost/finapp";
const DATABASE_URL_TEST =
	process.env.DATABASE_URL_TEST ||
	"postgresql://finapp_test@localhost/finapp_test";
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_API_KEY_SANDBOX = process.env.FINNHUB_API_KEY_SANDBOX;
const WWW_ROOT = process.env.WWW_ROOT || "http://localhost:3000";

module.exports = {
	NODE_ENV,
	PORT,
	DATABASE_URL,
	DATABASE_URL_TEST,
	SESSION_SECRET_KEY,
	FINNHUB_API_KEY,
	FINNHUB_API_KEY_SANDBOX,
	WWW_ROOT,
};
