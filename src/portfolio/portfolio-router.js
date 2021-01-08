/**
 * Express router for portfolio endpoints
 * @module
 */

const portfolioRouter = require("express").Router();
const PortfolioService = require("./portfolio-service");
const { handleGetPortfolio } = require("./portfolio-handlers");
const { loginRequired } = require("../auth/helpers");
const bodyParser = require("express").json();
const xss = require("xss");

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
		return handleGetPortfolio(req.user.id).then((portfolio) => {
			return res.status(200).json(portfolio);
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
			return res.status(400).json({ status: "invalid symbol", detail: issue });
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

		PortfolioService.addTicker(req.user.id, ticker)
			.then((dbResponse) => {
				return res
					.status(201)
					.json({ status: "success", newItemId: dbResponse[0].id });
			})
			.catch((err) => {
				if (err.code === 2) {
					return res.status(400).json({
						status: err.message,
					});
				}
				throw err;
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
		const ticker = xss(req.params.ticker);
		PortfolioService.deleteTicker(req.user.id, ticker).then((dbResponse) => {
			return res.status(204).send();
		});
	});

module.exports = portfolioRouter;
