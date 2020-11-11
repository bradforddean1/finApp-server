const fetch = require("node-fetch");

const {
	NODE_ENV,
	FINNHUB_API_KEY,
	FINNHUB_API_KEY_SANDBOX,
} = require("../../config/config");

const queryFinnhub = (endpoint, params) => {
	const BASE_URL = "https://finnhub.io//api/v1/";
	const api_key =
		NODE_ENV === "test" ? FINNHUB_API_KEY_SANDBOX : FINNHUB_API_KEY;

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
		.then((response) => response.json())
		.catch((error) => console.log("error", error));
};

const getCompanyProfile2 = (symbol) => {
	const params = { symbol: symbol };
	return queryFinnhub("stock/profile2", params);
};

const getStockCandles = (symbol, from, to) => {
	const params = {
		symbol: symbol,
		resolution: 1, //Some timeframes might not be available depending on the exchange.
		from: from,
		to: to,
	};

	return queryFinnhub("stock/candle", params);
};

const getBasicFinancials = (symbol) => {
	const params = { symbol: symbol, metric: "all" };
	return queryFinnhub("stock/metric", params);
};

module.exports = { getCompanyProfile2, getStockCandles, getBasicFinancials };
