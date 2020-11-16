const passportStub = require("passport-stub");
const app = require("../src/app");
const db = require("../db/connection");
const { makeQuoteKeysList } = require("./fixtures/app-fixtures");

passportStub.install(app);

describe("GET /quote", function () {
	// Common setup and teardown
	before("cleanup", function () {
		return db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});
	before("insert users", function () {
		return db.seed.run();
	});
	afterEach("logout", function () {
		passportStub.logout();
	});
	after("disconnect from db", function () {
		// db.destroy();
	});
	it("should return a quote", function () {
		passportStub.login(1);

		return supertest(app)
			.get("/quote")
			.set("symbol", "AAPL")
			.expect(200)
			.expect("Content-Type", "application/json; charset=utf-8")
			.then(function (res) {
				assert.deepInclude(res.body, {
					status: "success",
				});
				assert.deepInclude(res.body.quote, {
					ticker: "AAPL",
				});
				assert.hasAllKeys(res.body.quote, makeQuoteKeysList());
			});
	});

	it("should throw an error if a user is not logged in", function () {
		return supertest(app).get("/quote").expect(401);
	});

	// client errors

	// graceful api errors
});
