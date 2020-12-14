const {
	handleGetProfile,
	handleGetQuote,
} = require("../src/quote/handleGetQuote");
const {
	makeQuoteKeysList,
	makeProfileKeysList,
} = require("./fixtures/app-fixtures");
const dayjs = require("dayjs");

describe("handle get quote", function () {
	it("returns quote data for ticker provided", function () {
		const keys = makeQuoteKeysList();

		return handleGetQuote("AAPL", "monthly").then(function (response) {
			assert.include(response, {
				ticker: "AAPL",
			});
			assert.hasAllKeys(response, keys);
		});
	});

	it("returns error if ticker cannot be found", function () {
		return handleGetQuote("BAD", "monthly")
			.then(function (response) {
				assert.fail("expecting error to be thrown");
			})
			.catch(function (err) {
				assert.exists(err);
				assert.equal(err.message, "no profile for BAD");
			});
	});

	it.skip("returns error if profile request fails generally", function () {
		// requires mock of getCompanyProfile2
	});

	it.skip("returns partial results if fincnial request fails", function () {
		// requires mock of getQuote
	});
});

describe("handle get profile", function () {
	it("returns quote data for ticker provided", function () {
		const keys = makeProfileKeysList();

		return handleGetProfile("AAPL", "monthly").then(function (response) {
			assert.include(response, {
				ticker: "AAPL",
			});
			assert.hasAllKeys(response, keys);
		});
	});

	it("returns error if ticker cannot be found", function () {
		return handleGetProfile("BAD", "monthly")
			.then(function (response) {
				assert.fail("expecting error to be thrown");
			})
			.catch(function (err) {
				assert.exists(err);
				assert.equal(err.message, "no profile for BAD");
			});
	});

	// get candle data
	it("response includes formated candle data for ticker provided", function () {
		return handleGetProfile("AAPL", "year").then(function (response) {
			// conatains appropriate number of trading days for time frame provided
			assert.isAtLeast(response.chartData.length, 19);
			assert.isAtMost(response.chartData.length, 23);

			// all data objects are in order
			const anticStartDate = dayjs().subtract(1, "year").unix();
			const anticEndDate = dayjs().unix();
			for (const day of response.chartData) {
				assert.exists(new Date(day.date));
				assert.exists(day.close);
				assert.isNumber(day.close);
				assert.isAtLeast(day.date, anticStartDate);
				assert.isAtMost(day.date, anticEndDate);
			}

			// within the requested timeframe
		});
	});

	it("handles no chart period provided (should return 1 month data)", function () {
		return handleGetProfile("AAPL").then(function (response) {
			// conatains appropriate number of trading days for time frame provided
			assert.isAtLeast(response.chartData.length, 19);
			assert.isAtMost(response.chartData.length, 23);

			// all data objects are in order
			const anticStartDate = dayjs().subtract(1, "month").unix();
			const anticEndDate = dayjs().unix();
			for (const day of response.chartData) {
				assert.exists(new Date(day.date));
				assert.exists(day.close);
				assert.isNumber(day.close);
				assert.isAtLeast(day.date, anticStartDate);
				assert.isAtMost(day.date, anticEndDate);
			}

			// within the requested timeframe
		});
	});

	it.skip("returns error if profile request fails generally", function () {
		// requires mock of getCompanyProfile2
	});

	it.skip("returns partial results if fincnial request fails", function () {
		// requires mock of getBasicFinancials
	});

	it.skip("returns partial results if candles request fails", function () {
		// requires mock of getStockCandles
	});
});
