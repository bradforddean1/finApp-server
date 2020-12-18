/**
 * Express app
 * @module
 */

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, WWW_ROOT } = require("../config/config");
const session = require("express-session");
const passport = require("./auth/passport-config");
const errorHandler = require("./error-handler");

// --- JSdoc Swagger
// const expressJSDocSwagger = require("express-jsdoc-swagger");
// const { swaggerOpts } = require("../../config/jsdoc-swagger-config");
// expressJSDocSwagger(app)(swaggerOpts);

// routes
const authRouter = require("./auth/auth-router");
const quoteRouter = require("./quote/quote-router");
const portfolioRouter = require("./portfolio/portfolio-router");

// const portfolioRouter = require("./portfolio/portfolio-router");

// definitions
const app = express();
const morganSetting = NODE_ENV === "production" ? "tiny" : "dev";

// Middlewares
app.use(morgan(morganSetting));
app.use(helmet());
// app.use(cors());
// CORS
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
	res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
	if (req.method === "OPTIONS") {
		return res.send(204);
	}
	next();
});
app.use(
	session({
		secret: process.env.SESSION_SECRET_KEY,
		resave: false,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/portfolio", portfolioRouter);

// app.use("/portfolio", portfolioRouter);

app.get("/", (req, res) => {
	res.send("Hello Express!");
});

// handle server errors
app.use(errorHandler);

module.exports = app;
