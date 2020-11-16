const passportStub = require("passport-stub");
const app = require("../src/app");
const db = require("../db/connection");
const {
	makePortfolioItems,
	makeUsersArray,
} = require("./fixtures/app-fixtures");
const { assert } = require("chai");

passportStub.install(app);

describe("portfolio endpoints", function () {
	// Common setup and teardown
	before("cleanup users", function () {
		return db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	before("cleanup portfolio items", function () {
		return db.truncate("portfolio_items");
	});

	before("insert users", async function () {
		return db.into("users").insert(makeUsersArray());
	});

	after("cleanup db", function () {
		return db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	after("disconnect from db", function () {
		// return db.destroy();
	});

	beforeEach("populate tickers", function () {
		return db.into("portfolio_items").insert(makePortfolioItems());
	});

	afterEach("reset database", function () {
		return db.truncate("portfolio_items");
	});

	afterEach("logout", function () {
		return passportStub.logout();
	});

	describe("GET /portfolio", function () {
		it("should return a all tickers associated with user passed", function () {
			passportStub.login(1);
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
				.get("/portfolio")
				.expect(200, expected)
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/portfolio").expect(401);
		});
	});
	describe("POST /portfolio", function () {
		it("should return 400 if no ticker symbol provided", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
				.send("")
				.expect(400, {
					status: "invalid request",
					detail: "ticker symbol is requeried",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if no ticker symbol provided is not a string", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
				.send({ ticker: ["NEW"] })
				.expect(400, {
					status: "invalid request",
					detail: "ticker symbol must be alpha-numeric",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if no ticker symbol provided is longer than 5 characters", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
				.send({ ticker: "TOOLONG" })
				.expect(400, {
					status: "invalid request",
					detail: "ticker symbol has max 5 char",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if symbol already exists", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
				.send({ ticker: "AAPL" })
				.expect(400, {
					status: "bad request",
					detail: "ticker already exists for user",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return success if passed a ticker symbol", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
				.send({ ticker: "NEW" })
				.expect(201)
				.expect("Content-Type", "application/json; charset=utf-8")
				.then(function (res) {
					return assert.deepInclude(res.body, { status: "success" });
				});
		});

		it("should add the ticker to the database", function () {
			passportStub.login(1);

			return supertest(app)
				.post("/portfolio")
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

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/portfolio").expect(401);
		});
	});

	describe("DELETE /portfolio", function () {
		it("should return success", function () {
			passportStub.login(1);

			return supertest(app).delete("/portfolio/aapl").expect(204);
		});

		it("should be removed from the database", function () {
			passportStub.login(1);

			return supertest(app)
				.delete("/portfolio/aapl")
				.then(async function () {
					const allTickers = await db
						.from("portfolio_items")
						.select("*")
						.where("user_id", 1);
					return assert.notDeepInclude(allTickers, "NEW");
				});
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/portfolio").expect(401);
		});
	});
});
