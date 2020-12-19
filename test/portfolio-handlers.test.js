const { assert } = require("chai");
const { handleGetPortfolio } = require("../src/portfolio/portfolio-handlers");
const {
	makeUsersArray,
	makePortfolioItems,
} = require("./fixtures/app-fixtures");
const db = require("../db/connection");

before("cleanup users", function () {
	db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
});

before("reset portfolio items", function () {
	db.truncate("portfolio_items");
});

before("insert users", async function () {
	db.into("users").insert(makeUsersArray());
});

after("cleanup db table user", function () {
	db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
});

after("cleanup db table portfolio_items", function () {
	db.raw("TRUNCATE TABLE portfolio_items RESTART IDENTITY CASCADE");
});

beforeEach("populate tickers", function () {
	db.into("portfolio_items").insert(makePortfolioItems());
});

afterEach("reset database", function () {
	db.truncate("portfolio_items");
});

describe("Handle get user portfolio with current quotes", function () {
	it("Returns array of portfolio items", async function () {
		const portfolio = await handleGetPortfolio(1);
		assert.lengthOf(portfolio, 3);
		for (const pItem of portfolio) {
			// assert.hasAllKeys(pItem, []);
			assert.isOk(pItem.ticker);
			assert.isOk(pItem.current);
			assert.isOk(pItem.change);
			assert.isOk(pItem.changePct);
			assert.isOk(pItem.logo);
			assert.isOk(pItem.name);
		}
	});
});
