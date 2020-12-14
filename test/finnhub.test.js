const { assert } = require("chai");
const {
	getCompanyProfile2,
	getStockCandles,
	getBasicFinancials,
	getQuote,
} = require("../src/api/finnhub");

describe("finnhub api", function () {
	describe("get quote", () => {
		it("returns quote", async function () {
			await getQuote("AAPL")
				.then((response) => {
					assert.isAbove(response.c, 0);
					assert.isAbove(response.h, 0);
					assert.isAbove(response.l, 0);
					assert.isAbove(response.o, 0);
					assert.isAbove(response.pc, 0);
					assert.isAbove(response.t, 0);
				})
				.catch(() => {
					assert.fail("expected promise to resolve");
				});
			// assert includes other key params;
		});
		it("handles stock not found", async function () {
			assert.deepEqual(await getQuote("BAD"), {
				c: 0,
				h: 0,
				l: 0,
				o: 0,
				pc: 0,
				t: 0,
			});
		});
	});

	describe("get company profile (2)", () => {
		it("returns profile", async function () {
			assert.include(await getCompanyProfile2("AAPL"), { ticker: "AAPL" });
			// assert includes other key params;
		});
		it("handles stock not found", async function () {
			assert.isEmpty(await getCompanyProfile2("BAD"));
		});
	});

	describe("get stock candles", function () {
		it("returns candles for time frame in scope", async function () {
			assert.include(await getStockCandles("IBM", 1572651390, 1575243390), {
				s: "ok",
			});

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
			const actual = getBasicFinancials("BAD").then(function (response) {
				return response.metric;
			});
			assert.isObject(await actual);
			assert.isEmpty(await actual);
		});
	});
});
