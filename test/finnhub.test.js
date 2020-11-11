const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
} = require("../src/api/finnhub");

describe.skip("finnhub api", function () {
	describe("get company profile (2)", () => {
		it("returns stock quote", async function () {
			assert.include(await getCompanyProfile2("AAPL"), { ticker: "AAPL" });
			// assert includes other key params;
		});
		it("handles stock not found", async function () {
			assert.isEmpty(await getCompanyProfile2("BAD"));
		});
	});

	describe("get stock candles", function () {
		it("returns candles for time frame in scope", async function () {
			assert.include(await getStockCandles("AAPL", 1572651390, 1572910590), {
				s: "ok",
			}); // 11/01/2019 to 11/04/2019

			// assert includes other key params;
		});
		it("handles symbol not found", async function () {
			assert(await getStockCandles("BAD", 1572651390, 1572910590), {
				s: "no_data",
			}); // 11/01/2019 to 11/04/2019
		});
		it("handles date range out of scope", async function () {
			assert(await getStockCandles("AAPL", -6152044800, -6122044800), {
				s: "no_data",
			});
		});
		it("handles date range partially out of scope", async function () {
			assert(await getStockCandles("AAPL", 0, 1572910590), { s: "no_data" });
		});
	});

	describe("get stock financials", function () {
		it("returns candles for last 3 months", async function () {
			const actual = getBasicFinancials("AAPL");
			assert.isOk(await actual);
			assert.include(await actual, { symbol: "AAPL" });
			// assert includes other key params;
		});
		it("handles symbol not found", async function () {
			const actual = getBasicFinancials("BAD");
			assert.isEmpty(await actual.metric);
		});
	});
});
