/**
 * Express router for quote endpoints
 * @module
 */

const quoteRouter = require("express").Router();
const { handleGetProfile, handleGetQuote } = require("./handleGetQuote");

quoteRouter
	.route("/:symbol")
	/**
	 * Get basic security quote data
	 *
	 * @name Quote
	 * @route {GET} /quote/:ticker
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */
	.get((req, res, next) => {
		const ticker = req.params.symbol;

		if (typeof ticker != "string" || ticker.length > 5) {
			return res.status(400).json({
				status: "invalid symbol",
			});
		}

		handleGetQuote(ticker)
			.then((quote) => {
				return res.status(200).json({
					status: "success",
					quote: quote,
				});
			})
			.catch((err) => {
				if (err.code === 1) {
					return res.status(200).json({
						status: "no match",
					});
				}
				return res.status(500).json({
					status: "server error",
				});
			});
	});

/**
 * Get Fundamentals data in addiiton to the simple quote data
 *
 * @name Profile
 * @route {GET} /quote/:ticker/profile
 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
 */
quoteRouter.route("/:symbol/profile").get((req, res, next) => {
	const ticker = req.params.symbol;

	if (typeof ticker != "string" || ticker.length > 5) {
		return res.status(400).json({
			status: "invalid symbol",
		});
	}

	handleGetProfile(ticker)
		.then((profile) => {
			return res.status(200).json({
				status: "success",
				profile: profile,
			});
		})
		.catch((err) => {
			if (err.code === 1) {
				return res.status(200).json({
					status: "no match",
				});
			}
			return res.status(500).json({
				status: "server error",
			});
		});
});
module.exports = quoteRouter;
