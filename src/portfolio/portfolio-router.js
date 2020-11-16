/**
 * Express router for portfolio endpoints
 * @module
 */

const portfolioRouter = require("express").Router();
const PortfolioService = require("./portfolio-service");
const { loginRequired } = require("../auth/helpers");
const bodyParser = require("express").json();

portfolioRouter
	.route("/")
	/**
	 * Get saved tickers
	 *
	 * @name Portfolio
	 * @route {GET} /portfolio
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */
	.get(loginRequired, (req, res, next) => {
		PortfolioService.getTickersbyUser(req.user.id).then((tickers) => {
			return res.status(200).json(tickers);
		});
	})
	/**
	 * Add new to saved tickers
	 *
	 * @name Portfolio
	 * @route {POST} /portfolio
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */
	.post(bodyParser, loginRequired, (req, res) => {
		const ticker = req.body.ticker;

		function sendValFailure(issue) {
			return res.status(400).json({ status: "invalid request", detail: issue });
		}

		if (!ticker) {
			return sendValFailure("ticker symbol is requeried");
		}

		if (typeof ticker != "string") {
			return sendValFailure("ticker symbol must be alpha-numeric");
		}

		if (ticker.length > 5) {
			return sendValFailure("ticker symbol has max 5 char");
		}

		PortfolioService.addTicker(req.user.id, ticker).then((dbResponse) => {
			if (dbResponse.badRequest) {
				return res
					.status(400)
					.json({ status: "bad request", detail: dbResponse.message });

				// *** q here - is this necessary or should just let db error float up stack and drrop the catch stmt.
				// return res.status(500).json({ status: "unexpected error occured" });
			}

			return res
				.status(201)
				.json({ status: "success", newItemId: dbResponse[0].id });
		});
	});

portfolioRouter
	.route("/:ticker")
	/**
	 * Get saved tickers
	 *
	 * @name Portfolio
	 * @route {DELETE} /portfolio/:ticker
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */
	.delete(loginRequired, (req, res) => {
		PortfolioService.deleteTicker(req.user.id, "AAPL").then((dbResponse) => {
			return res.status(204).json(dbResponse);
		});
	});

module.exports = portfolioRouter;
