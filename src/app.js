/**
 * Express app
 * @module
 */

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ROOT } = require("../config/config");
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

// definitions
const app = express();
const morganSetting = NODE_ENV === "production" ? "tiny" : "dev";

// Middlewares
app.use(morgan(morganSetting));
app.use(helmet());

app.use(passport.initialize());

app.use(
	cors({
		origin: CLIENT_ROOT,
		methods: ["POST", "GET", "DELETE", "OPTIONS"],
		credentials: true,
	})
);

// CORS
// app.use(function (req, res, next) {
// 	res.header("Access-Control-Allow-Origin", CLIENT_ROOT);
// 	res.header("Access-Control-Allow-Credentials", "true");
// 	res.header(
// 		"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
// 	);
// 	res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");

// next();
// });

app.use("/api/auth", authRouter);
app.use(
	"/api/quote",
	passport.authenticate("jwt", { session: false }),
	quoteRouter
);
app.use(
	"/api/portfolio",
	passport.authenticate("jwt", { session: false }),
	portfolioRouter
);

// handle server errors
app.use(errorHandler);

module.exports = app;
