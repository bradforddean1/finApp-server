const quoteRouter = require("express").Router();
const { loginRequired } = require("../auth/helpers");
const { handleGetQuote } = require("./handleGetQuote");

quoteRouter.route("/").get(loginRequired, (req, res, next) => {
	const quote = handleGetQuote("AAPL");
	return res.status(200).json({
		status: "success",
		quote: quote,
	});
});

module.exports = quoteRouter;
