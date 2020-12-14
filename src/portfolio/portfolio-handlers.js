const { handleGetQuote } = require("../quote/handleGetQuote");
const PortfolioService = require("./portfolio-service");
/**
 * Handles retrieval of portfolio items for user form DB and colelction
 * of quote for each portfolio item.
 *
 * @param {number} userId - Objects with ticker param for
 * @returns {Promise} - Resolves with array of objects with portfolio item data.
 */
const handleGetPortfolio = (userId) => {
	return PortfolioService.getTickersbyUser(userId).then((portfolio) => {
		const quotes = [];
		for (const item of portfolio) {
			quotes.push(handleGetQuote(item.ticker));
		}

		return Promise.all(quotes).then((allQuotes) => {
			return allQuotes;
		});
	});
};

module.exports = { handleGetPortfolio };
