/**
 * Handler for Get /quote route
 * @module
 */

const dayjs = require("dayjs");

const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
} = require("../api/finnhub");

/**
 * Fetches, trasnforms, and consolidates data for given ymbol
 * @param {string} symbol - Ticker symbol
 * @param {string} chartPeriod - Data period for chart data, accepts "month" or "year"
 * @returns {Promise} - Returns promise, resolves with quote object with company profile, financial data, and chart data for candles.
 */
const handleGetQuote = (symbol, chartPeriod) => {
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
			throw new Error(`no profile for ${symbol}`);
		}

		Object.assign(filteredRes, { country });
		Object.assign(filteredRes, { currency });
		Object.assign(filteredRes, { exchange });
		Object.assign(filteredRes, { ipo });
		Object.assign(filteredRes, { marketCapitalization });
		Object.assign(filteredRes, { name });
		Object.assign(filteredRes, { shareOutstanding });
		Object.assign(filteredRes, { ticker });
		Object.assign(filteredRes, { weburl });
		Object.assign(filteredRes, { logo });
		Object.assign(filteredRes, { finnhubIndustry });

		return filteredRes; // pull out desired
	});

	/*
	 * NO CATCH: If profile pull is not successful handle get quote should fail.  Additional
	 * queries i.e. candles/financials can fail and return partial quote.
	 */

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

	return Promise.all([profile, candles, financials]).then((allData) => {
		//need to handle if get quote fails for profile then should stop whole thing.

		const summary = {};
		for (const dataPoint of allData) {
			Object.assign(summary, dataPoint);
		}
		return summary;
	});
};

module.exports = { handleGetQuote };
