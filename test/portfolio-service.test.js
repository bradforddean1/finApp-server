const portfolioService = require("../../src/portfolio/portfolio-service");
const db = require("../../db/connection");
const { makePortfolioItems } = require("../fixtures/portfolio-fixtures");
const { assert } = require("chai");

describe("portfolio service", function () {
	beforeEach("populate tickers", function () {
		return db.into("portfolio_items").insert(makePortfolioItems());
	});

	afterEach("reset database", function () {
		return db.truncate("portfolio_items");
	});

	describe("get all tickers for user", function () {
		it("returns all of the tickers for a user portfolio", async function () {
			const anticiapted = [
				{
					ticker: "AAPL",
				},
				{
					ticker: "TSLA",
				},
				{
					ticker: "FUN",
				},
			];
			const actual = await portfolioService.getTickersbyUser(1);
			return assert.deepEqual(actual, anticiapted);
		});
	});

	describe("post new ticker to user portfolio", function () {
		it("returns adds on new ticker to the users portfolio given user and ticker", async function () {
			const expected_less_date = {
				id: 4,
				ticker: "NEW",
				user_id: 1,
			};

			const actual = await portfolioService.addTicker(1, "NEW");
			assert.deepInclude(actual[0], expected_less_date);
			assert.lengthOf(actual, 1);
			assert.deepEqual(
				new Date(actual[0].added_on).toLocaleString(),
				new Date().toLocaleString()
			);
		});
		it("returns already exists if ticker being added already exists", async function () {
			assert.deepEqual(await portfolioService.addTicker(1, "AAPL"), {
				error: true,
				code: 1,
				message: "ticker already exists for user",
			});
		});
		it("returns database error if user associated passed does not exist", async function () {
			assert.deepEqual(await portfolioService.addTicker(5, "NEW"), {
				error: true,
				code: 2,
				message: "database error",
			});
		});
	});

	describe("delete ticker from user portfolio", async function () {
		it("deletes a ticker to the users portfolio given user and ticker", async function () {
			const result = await portfolioService.deleteTicker(1, "AAPL");
			assert.isAbove(result, 0);
		});
	});
});
