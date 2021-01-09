const app = require("../src/app");
const db = require("../db/connection");
const {
	makePortfolioItems,
	makeUsersArray,
} = require("./fixtures/app-fixtures");
const { assert } = require("chai");

describe.skip("portfolio endpoints", function () {
	// Common setup and teardown
	before("cleanup users", function () {
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	before("cleanup portfolio items", function () {
		db.raw("TRUNCATE TABLE portfolio_items RESTART IDENTITY CASCADE");
	});

	before("insert users", async function () {
		db.into("users").insert(makeUsersArray());
	});

	beforeEach("populate tickers", function () {
		db.into("portfolio_items").insert(makePortfolioItems());
	});

	afterEach("reset database", function () {
		db.raw("TRUNCATE TABLE portfolio_items RESTART IDENTITY CASCADE");
	});

	after("cleanup users", function () {
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	describe("GET /api/portfolio", function () {
		it("should return a all tickers associated with user passed", function () {
			const expected = [
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

			return supertest(app)
				.get("/api/portfolio")
				.expect(200, expected)
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/api/portfolio").expect(401);
		});
	});

	describe("POST /api/portfolio", function () {
		it("should return 400 if no ticker symbol provided", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send("")
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol is requeried",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if ticker symbol provided is not a string", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send({ ticker: ["NEW"] })
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol must be alpha-numeric",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if no ticker symbol provided is longer than 5 characters", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send({ ticker: "TOOLONG" })
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol has max 5 char",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if symbol already exists", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send({ ticker: "AAPL" })
				.expect(400, {
					status: "ticker already exists for user",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return success if passed a ticker symbol", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send({ ticker: "NEW" })
				.expect(201)
				.expect("Content-Type", "application/json; charset=utf-8")
				.then(function (res) {
					return assert.deepInclude(res.body, { status: "success" });
				});
		});

		it("should add the ticker to the database", function () {
			return supertest(app)
				.post("/api/portfolio")
				.send({ ticker: "NEW" })
				.then(async function (res) {
					const allTickers = await db
						.from("portfolio_items")
						.select("*")
						.where("user_id", 1)
						.where("ticker", "NEW");
					assert.lengthOf(allTickers, 1);
					assert.deepInclude(res.body, { newItemId: allTickers[0].id });
				});
		});

		it("should thwart xss attack", function () {
			return assert.throw();
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/api/portfolio").expect(401);
		});
	});

	describe("DELETE /api/portfolio", function () {
		it("should return success", function () {
			return supertest(app).delete("/api/portfolio/aapl").expect(204);
		});

		it("should be removed from the database", function () {
			return supertest(app)
				.delete("/api/portfolio/aapl")
				.then(async function () {
					const allTickers = await db
						.from("portfolio_items")
						.select("*")
						.where("user_id", 1);
					return assert.notDeepInclude(allTickers, "NEW");
				});
		});

		it("should thwart xss attack", function () {
			return assert.throw();
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/api/portfolio").expect(401);
		});
	});
});
