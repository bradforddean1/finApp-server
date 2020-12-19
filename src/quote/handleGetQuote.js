/**
 * Handlers for quote and profile routes
 * @module
 */

const dayjs = require("dayjs");
const { mergeData } = require("./quote-helpers");
const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
	getQuote,
} = require("../api/finnhub");

const formatCurrency = (number, currency, country) => {
	new Intl.NumberFormat(country, {
		style: "currency",
		currency: currency,
	}).format(number);
};

/**
 * Handles profile and current quote data retirval.
 * Handles fetch and transform data for symbol
 * @param {string} symbol - Ticker symbol
 * @param {string} chartPeriod - Data period for chart data, accepts "month" or "year"
 * @returns {Promise} - Returns promise, resolves with quote object with company profile, financial data, and chart data for candles.
 */
const handleGetQuote = (symbol) => {
	// Get Profile
	const profile = getCompanyProfile2(symbol).then((apiResponse) => {
		const filteredRes = {};

		const {
			country,
			currency,
			exchange,
			ipo,
			marketCapitalization,
			name,
			shareOutstanding,
			ticker,
			weburl,
			logo,
			finnhubIndustry,
		} = apiResponse;

		if (!ticker) {
			const err = new Error(`no profile for ${symbol}`);
			err.code = 1;
			throw err;
		}

		const website = weburl.split("/")[2];

		Object.assign(filteredRes, { country });
		Object.assign(filteredRes, { currency });
		Object.assign(filteredRes, { exchange });
		Object.assign(filteredRes, { ipo });
		Object.assign(filteredRes, {
			marketCapitalization: formatCurrency(
				marketCapitalization,
				currency,
				country
			),
		});
		Object.assign(filteredRes, { name });
		Object.assign(filteredRes, { shareOutstanding });
		Object.assign(filteredRes, { ticker });
		Object.assign(filteredRes, { website });
		Object.assign(filteredRes, { logo });
		Object.assign(filteredRes, { finnhubIndustry });
		return filteredRes;

		// Errors are not caught for getProfie2 If profile pull is not successful
		// handleGetQuote should fail.
	});

	const quote = getQuote(symbol)
		.then((apiResponse) => {
			const filteredRes = {};
			const { c, pc } = apiResponse;

			const current = "$".concat(c.toFixed(2).toString());
			const change = (c - pc).toFixed(2).toString();
			const changePct = (((c - pc) / pc) * 100)
				.toFixed(2)
				.toString()
				.concat("%");

			Object.assign(filteredRes, { current });
			Object.assign(filteredRes, { change });
			Object.assign(filteredRes, { changePct });

			return filteredRes;
		})
		.catch((err) => {
			return {};
		});

	// Return one object with all of the query data merged.
	return mergeData([profile, quote]);
};

/**
 * Handles profile and current quote data retirval with financial profile and chart data.
 * Handles fetch and transform data for symbol
 * @param {string} symbol - Ticker symbol
 * @param {string} chartPeriod - Data period for chart data, accepts "month" or "year"
 * @returns {Promise} - Returns promise, resolves with quote object with company profile, financial data, and chart data for candles.
 */
const handleGetProfile = (symbol, chartPeriod) => {
	// Get results from handleGetQuote - handleGetProfile adds to handleGetQuote.
	const quote = handleGetQuote(symbol);

	// Errors are not caught for handleGetQuote. If quote pull is not successful
	// handle getSecuirityDetail should fail.  Additional queries i.e. candles/financials
	// can fail and return partial quote.

	// Get Candles - handleGetQuote can
	const today = dayjs().unix();
	let start = dayjs().unix();

	if (chartPeriod != "month" || chartPeriod != "year") {
		chartPeriod = "month";
	}

	start = dayjs().subtract(1, chartPeriod).unix();

	const candles = getStockCandles(symbol, start, today)
		.then((apiResponse) => {
			// manipulate to meet needs for chart js

			const combined = apiResponse.t.map((timestamp, i) => {
				return { date: new Date(timestamp).getTime(), close: apiResponse.c[i] };
			});
			return { chartData: combined };
		})
		.catch((err) => {
			return {};
		});
	getStockCandles;

	// Get financials
	const financials = getBasicFinancials(symbol)
		.then((apiResponse) => {
			const filteredRes = {};

			const {
				peNormalizedAnnual,
				pbAnnual,
				dividendPerShareAnnual,
				dividendYieldIndicatedAnnual,
				dividendPerShare5Y,
				dividendYield5Y,
				dividendGrowthRate5Y,
				epsBasicExclExtraItemsAnnual,
				epsGrowth3Y,
				epsGrowth5Y,
				epsGrowthTTMYoy,
				currentRatioAnnual,
				currentRatioQuarterly,
			} = apiResponse.metric;

			// current ratio
			Object.assign(filteredRes, { currentRatioAnnual });
			Object.assign(filteredRes, { currentRatioQuarterly });

			// PositiveEarnings per Share Growth
			Object.assign(filteredRes, { epsBasicExclExtraItemsAnnual });
			Object.assign(filteredRes, { epsGrowth3Y });
			Object.assign(filteredRes, { epsGrowth5Y });
			Object.assign(filteredRes, { epsGrowthTTMYoy });

			// Price to Earnigns / Price to Book
			Object.assign(filteredRes, { peNormalizedAnnual }); //     peNormalizedAnnual: 137.34035,
			Object.assign(filteredRes, { pbAnnual }); //     pbAnnual: 80.15581,

			// dividends
			Object.assign(filteredRes, { dividendPerShareAnnual }); //     dividendPerShareAnnual: 2.625,
			Object.assign(filteredRes, { dividendYieldIndicatedAnnual }); //     dividendYieldIndicatedAnnual: 2.46141,
			Object.assign(filteredRes, { dividendPerShare5Y }); //     dividendPerShare5Y: 2.149,
			Object.assign(filteredRes, { dividendYield5Y }); //     dividendYield5Y: 5.20275,
			Object.assign(filteredRes, { dividendGrowthRate5Y }); //     dividendGrowthRate5Y: 39.30465,

			return filteredRes;
		})
		.catch((err) => {
			return {};
		});

	// Return one object with all of the query data merged.
	return mergeData([candles, financials, quote]);
};

module.exports = { handleGetQuote, handleGetProfile };
