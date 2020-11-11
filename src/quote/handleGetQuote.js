const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
} = require("../api/finnhub");

const handleGetQuote = (symbol, chartPeriod) => {
	const profile = getCompanyProfile2().then(() => {
		// pull out desired
	});
	const candles = getStockCandles().then(() => {
		// pull out desired
		// manipulate to meet needs for chart js
	});
	const financials = getBasicFinancials().then(() => {
		// pull out desired
		// PositiveEarnings per Share Growth
		//
		// Price to Earnigns / Price to Book
		//     peNormalizedAnnual: 137.34035,
		//     pbAnnual: 80.15581,
		// dividends
		//     dividendPerShareAnnual: 2.625,
		//     dividendYieldIndicatedAnnual: 2.46141,
		//     dividendPerShare5Y: 2.149,
		//     dividendYield5Y: 5.20275,
		//     dividendGrowthRate5Y: 39.30465,
	});

	Promise.all([profile, candles, financials]).then(() => {
		const summary = {
			// fill in here.
		};
		return summary;
	});

	return getQuote(symbol).then((response) => {
		console.log("res: ", response);
		return response;
	});
};

module.exports = { handleGetQuote };
