/**
 * Handlers for quote and profile routes
 * @module
 */

const dayjs = require("dayjs");
const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
	getQuote,
} = require("../api/finnhub");

const formatCurrency = (number, currency) => {
	country = currency = currency;
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(number);
	} catch (error) {
		return number.toFixed(2).toString();
	}
};

const formatPercent = (number) => {
	return number.toFixed(2).toString().concat("%");
};

const formatRatio = (number) => {
	return number.toFixed(2).toString().concat("x");
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
		const { ticker } = apiResponse;
		if (!ticker) {
			const err = new Error(`no profile for ${symbol}`);
			err.code = 1;
			throw err;
		}
		return apiResponse;
	});
	// Errors are not caught for getProfie2 If profile pull is not successful
	// handleGetQuote should fail.

	const quote = getQuote(symbol).catch((err) => {
		return {};
	});

	// Return one object with all of the query data merged.
	return Promise.all([profile, quote]).then((allData) => {
		const filteredRes = {};

		const profile = allData[0];
		const quote = allData[1];

		// Transform Profile
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
		} = profile;

		const website = weburl.split("/")[2];

		Object.assign(filteredRes, { country });
		Object.assign(filteredRes, { currency });
		Object.assign(filteredRes, { exchange });
		Object.assign(filteredRes, { ipo });
		Object.assign(filteredRes, {
			marketCapitalization: formatCurrency(marketCapitalization, currency),
		});
		Object.assign(filteredRes, { name });
		Object.assign(filteredRes, {
			shareOutstanding: shareOutstanding.toFixed(2).toString(),
		});
		Object.assign(filteredRes, { ticker });
		Object.assign(filteredRes, { website });
		Object.assign(filteredRes, { logo });
		Object.assign(filteredRes, { finnhubIndustry });

		// Quote
		const { c, pc } = quote;

		const current = formatCurrency(c, profile.currency);
		const change = (c - pc).toFixed(2).toString();
		const changePct = formatPercent(((c - pc) / pc) * 100);

		Object.assign(filteredRes, { current });
		Object.assign(filteredRes, { change });
		Object.assign(filteredRes, { changePct });

		Object.assign(filteredRes, profile);

		return filteredRes;
	});
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
			const combined = apiResponse.t.map((timestamp, i) => {
				return { date: new Date(timestamp).getTime(), close: apiResponse.c[i] };
			});
			return { chartData: combined };
		})
		.catch((err) => {
			return {};
		});

	// Get financials
	const financials = getBasicFinancials(symbol)
		.then((apiResponse) => {
			return apiResponse.metric;
		})
		.catch((err) => {
			return {};
		});

	// Return one object with all of the query data merged.
	return Promise.all([candles, financials, quote]).then((allData) => {
		const filteredRes = {};

		const candles = allData[0];
		const financials = allData[1];
		const quote = allData[2];

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
		} = financials;

		// quote
		Object.assign(filteredRes, quote);

		// current ratio
		Object.assign(filteredRes, {
			currentRatioAnnual: formatRatio(currentRatioAnnual),
		});
		Object.assign(filteredRes, {
			currentRatioQuarterly: formatRatio(currentRatioQuarterly),
		});

		// PositiveEarnings per Share Growth
		Object.assign(filteredRes, {
			epsBasicExclExtraItemsAnnual: formatCurrency(
				epsBasicExclExtraItemsAnnual,
				quote.currency
			),
		});
		Object.assign(filteredRes, {
			epsGrowth3Y: formatCurrency(epsGrowth3Y, quote.currency),
		});
		Object.assign(filteredRes, {
			epsGrowth5Y: formatCurrency(epsGrowth5Y, quote.currency),
		});
		Object.assign(filteredRes, {
			epsGrowthTTMYoy: formatCurrency(epsGrowthTTMYoy, quote.currency),
		});

		// Price to Earnigns / Price to Book
		Object.assign(filteredRes, {
			peNormalizedAnnual: formatRatio(peNormalizedAnnual),
		}); //     peNormalizedAnnual: 137.34035,
		Object.assign(filteredRes, { pbAnnual: formatRatio(pbAnnual) }); //     pbAnnual: 80.15581,

		// dividends
		Object.assign(filteredRes, {
			dividendPerShareAnnual: formatCurrency(
				dividendPerShareAnnual,
				quote.currency
			),
		});
		Object.assign(filteredRes, {
			dividendYieldIndicatedAnnual: formatCurrency(
				dividendYieldIndicatedAnnual,
				quote.currency
			),
		});
		Object.assign(filteredRes, {
			dividendPerShare5Y: formatCurrency(dividendPerShare5Y, quote.currency),
		});
		Object.assign(filteredRes, {
			dividendYield5Y: formatCurrency(dividendYield5Y, quote.currency),
		});
		Object.assign(filteredRes, {
			dividendGrowthRate5Y: formatCurrency(
				dividendGrowthRate5Y,
				quote.currency
			),
		});

		return filteredRes;
	});
};

module.exports = { handleGetQuote, handleGetProfile };
