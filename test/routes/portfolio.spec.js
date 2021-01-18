const db = require("../../db/connection");
const {
	makePortfolioItems,
	makeQuoteKeysList,
	makeUsersArray,
} = require("../fixtures/app-fixtures");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_TEST } = require("../../config/config");

describe("portfolio endpoints", function () {
	/* ****************************************************************************
	 *                             PORTFOLIO ENDPOINTS                            *
	 ******************************************************************************
	 *
	 * -> GET
	 * -> POST
	 * -> DELETE
	 */
	const testUserId = 1;
	const testUserUsername = "steve";
	const token = jwt.sign(
		{ user_id: testUserId }, // payload
		JWT_SECRET_TEST,
		{
			subject: testUserUsername,
			algorithm: "HS256",
		}
	);
	const bearerToken = `bearer ${token}`;

	// Common setup and teardown
	before("cleanup db", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
		await db.raw("TRUNCATE TABLE portfolio_items RESTART IDENTITY CASCADE");
	});

	before("insert users", async function () {
		await db.into("users").insert(makeUsersArray());
		await db.into("portfolio_items").insert(makePortfolioItems());
	});

	after("cleanup db", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
		await db.raw("TRUNCATE TABLE portfolio_items RESTART IDENTITY CASCADE");
	});

	/*
	 * Get all in User Portfolio
	 */
	describe("GET /api/portfolio", function () {
		it("should return all tickers associated with user passed", function () {
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

			return supertest
				.get("/api/portfolio")
				.set({ Authorization: bearerToken })
				.expect(200)
				.expect("Content-Type", "application/json; charset=utf-8")
				.then(function (res) {
					res.body.forEach((element) => {
						assert.hasAllKeys(element, makeQuoteKeysList());
					});
				});
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest.get("/api/portfolio").expect(401);
		});
	});

	/*
	 * Post new to user Portfolio
	 */
	describe("POST /api/portfolio", function () {
		it("should return 400 if no ticker symbol provided", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })
				.send("")
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol is requeried",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if ticker symbol provided is not a string", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })
				.send({ ticker: ["NEW"] })
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol must be alpha-numeric",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if no ticker symbol provided is longer than 5 characters", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })
				.send({ ticker: "TOOLONG" })
				.expect(400, {
					status: "invalid symbol",
					detail: "ticker symbol has max 5 char",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 400 if symbol already exists", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })
				.send({ ticker: "AAPL" })
				.expect(400, {
					status: "ticker already exists for user",
				})
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return success if passed a ticker symbol", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })
				.send({ ticker: "NEW" })
				.expect(201)
				.expect("Content-Type", "application/json; charset=utf-8")
				.then(function (res) {
					return assert.deepInclude(res.body, { status: "success" });
				});
		});

		it("should add the ticker to the database", function () {
			return supertest
				.post("/api/portfolio")
				.set({ Authorization: bearerToken })s
				.send({ ticker: "NEWER" })
				.then(async function (res) {
					const allTickers = await db
						.from("portfolio_items")
						.select("*")
						.where("user_id", 1)
						.where("ticker", "NEWER");
					assert.lengthOf(allTickers, 1);
					console.log("TEST", allTickers);
					assert.deepInclude(res.body, { newItemId: allTickers[0].id });
				});
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest.get("/api/portfolio").expect(401);
		});
	});

	/*
	 * Delete from User Portfolio
	 */
	describe("DELETE /api/portfolio", function () {
		it("should return success", function () {
			return supertest
				.delete("/api/portfolio/aapl")
				.set({ Authorization: bearerToken })
				.expect(204);
		});

		it("should be removed from the database", function () {
			return supertest
				.delete("/api/portfolio/aapl")
				.set({ Authorization: bearerToken })
				.then(async function () {
					const allTickers = await db
						.from("portfolio_items")
						.select("*")
						.where("user_id", 1);
					return assert.notDeepInclude(allTickers, "NEW");
				});
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest.get("/api/portfolio").expect(401);
		});
	});
});
