require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("../config/config");
const session = require("express-session");
const passport = require("./auth/passport-config");

// routes
const authRouter = require("./auth/auth-router");
const userRouter = require("./users/user-router");
const quoteRouter = require("./quote/quote-router");
const portfolioRouter = require("./portfolio/portfolio-router");

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
app.use("/user", userRouter);
app.use("/quote", quoteRouter);
app.use("/portfolio", portfolioRouter);

app.get("/", (req, res) => {
	res.send("Hello Express!");
});
// handle server errors
app.use((error, req, res, next) => {
	let response;
	if (NODE_ENV === "production") {
		response = { error: { message: "server error" } };
	} else {
		console.log(error);
		response = { message: error.message, error };
	}
	res.status(500).json(response);
});

module.exports = app;
