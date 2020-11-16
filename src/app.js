/**
 * Express app
 * @module
 */

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("../config/config");
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
app.use(cors());
app.use(
	session({
		secret: process.env.SESSION_SECRET_KEY,
		resave: false,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/quote", quoteRouter);
app.use("/portfolio", portfolioRouter);

// app.use("/portfolio", portfolioRouter);

app.get("/", (req, res) => {
	res.send("Hello Express!");
});

// handle server errors
app.use(errorHandler);

module.exports = app;
