/**
 * Finnhub API service
 * @module
 */

const fetch = require("node-fetch");
const logger = require("../logger");

const {
	NODE_ENV,
	FINNHUB_API_KEY,
	FINNHUB_API_KEY_SANDBOX,
} = require("../../config/config");

/**
 * Query the Finnhub API
 * @param {string} endpoint
 * @param {object} params
 * @returns {Promise} - Query response from Finnhub server
 * @throws {Error} - When api fetch does not resolve
 */
const queryFinnhub = (endpoint, params) => {
	const BASE_URL = "https://finnhub.io//api/v1/";
	const api_key =
		NODE_ENV === "test" || NODE_ENV === "dev"
			? FINNHUB_API_KEY_SANDBOX
			: FINNHUB_API_KEY;

	const headers = { "X-Finnhub-Token": api_key };

	const requestOptions = {
		method: "GET",
		headers: headers,
		redirect: "follow",
	};

	function formatQueryParams(params) {
		const queryItems = Object.keys(params).map(
			(key) => `${key}=${params[key]}`
		);
		return queryItems.join("&");
	}

	const queryString = [BASE_URL, endpoint, "?", formatQueryParams(params)].join(
		""
	);

	return fetch(queryString, requestOptions)
		.then((response) => {
			return response.json();
		})
		.catch((error) => {
			/*
			 * Logs api error and throws new error, depending on inquiry made we may or may not
			 * want to stop the request. Errors that can be dealt with are caught by handler.
			 */
			logger.error(error);
			throw new Error(
				`FINHUB API ERROR -- API call failed when requesting ${queryString}`
			);
		});
};

/**
 * Query Finhubb API "Quote" endpoint
 * @param {string} symbol - Ticker symbol
 * @returns {Promise} - Query results
 */
const getQuote = (symbol) => {
	const params = { symbol: symbol };
	return queryFinnhub("quote", params);
};

/**
 * Query Finhubb API "Company Profile 2" endpoint
 * @param {string} symbol - Ticker symbol
 * @returns {Promise} - Query results
 */
const getCompanyProfile2 = (symbol) => {
	const params = { symbol: symbol };
	return queryFinnhub("stock/profile2", params);
};

/**
 * Query Finhubb API "Stick Quote Candles" endpoint
 * @param {string} symbol - Ticker symbol
 * @param {number} from - Unix timestamp
 * @param {number} to - Unix timestamp
 * @returns {Promise} - Query results
 */
const getStockCandles = (symbol, from, to) => {
	const params = {
		symbol: symbol,
		resolution: "D", //Some timeframes might not be available depending on the exchange.
		from: from,
		to: to,
	};

	return queryFinnhub("stock/candle", params);
};

/**
 * Query Finhubb API "Basic Financials" endpoint
 * @param {string} symbol - Ticker symbol
 * @returns {Promise} - Query results
 */
const getBasicFinancials = (symbol) => {
	const params = { symbol: symbol, metric: "all" };
	return queryFinnhub("stock/metric", params);
};

module.exports = {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
	getQuote,
};
