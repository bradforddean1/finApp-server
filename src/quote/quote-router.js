/**
 * Express router for quote endpoints
 * @module
 */

const quoteRouter = require("express").Router();
const { loginRequired } = require("../auth/helpers");
const { handleGetQuote } = require("./handleGetQuote");

quoteRouter
	.route("/")
	/**
	 * Get saved tickers
	 *
	 * @name Quote
	 * @route {GET} /quote
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */
	.get(loginRequired, (req, res, next) => {
		handleGetQuote("AAPL")
			.then((quote) => {
				return res.status(200).json({
					status: "success",
					quote: quote,
				});
			})
			.catch((err) => {
				if (err) {
					return res.status(400).json({ status: "bad request", detail: err });
				}
			});
	});

module.exports = quoteRouter;
