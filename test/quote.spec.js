const passportStub = require("passport-stub");
const app = require("../src/app");
const db = require("../db/connection");
const {
	makeQuoteKeysList,
	makeProfileKeysList,
} = require("./fixtures/app-fixtures");

passportStub.install(app);

describe("GET /api/quote", function () {
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
	describe("Get Quote", () => {
		it("should return a quote", function () {
			passportStub.login(1);

			return supertest(app)
				.get("/api/quote/AAPL")
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
			return supertest(app).get("/api/quote/AAPL").expect(401);
		});

		it("should return 'no match' if no match to ticker found", function () {
			passportStub.login(1);

			return supertest(app)
				.get("/api/quote/BAD")
				.expect(200, { status: "no match" });
		});

		it("should return 404 if no ticker provided", function () {
			passportStub.login(1);

			return supertest(app).get("/api/quote").expect(404);
		});

		it("should return 400 if ticker provided in invalid format", function () {
			passportStub.login(1);

			return supertest(app).get("/api/quote/VERYBAD").expect(400, {
				status: "invalid symbol",
			});
		});
	});

	describe("Get Profile", () => {
		it("should return a quote", function () {
			passportStub.login(1);

			return supertest(app)
				.get("/api/quote/AAPL/profile")
				.expect(200)
				.expect("Content-Type", "application/json; charset=utf-8")
				.then(function (res) {
					assert.deepInclude(res.body, {
						status: "success",
					});
					assert.deepInclude(res.body.profile, {
						ticker: "AAPL",
					});
					assert.hasAllKeys(res.body.profile, makeProfileKeysList());
				});
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/api/quote/AAPL/profile").expect(401);
		});

		it("should return 'no match' if no match to ticker found", function () {
			passportStub.login(1);

			return supertest(app)
				.get("/api/quote/BAD/profile")
				.expect(200, { status: "no match" });
		});

		it("should return 400 if ticker provided in invalid format", function () {
			passportStub.login(1);

			return supertest(app).get("/api/quote/VERYBAD/profile").expect(400, {
				status: "invalid symbol",
			});
		});
	});
});
