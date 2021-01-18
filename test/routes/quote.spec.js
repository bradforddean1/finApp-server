const db = require("../../db/connection");
const {
	makeQuoteKeysList,
	makeProfileKeysList,
	makeUsersArray,
} = require("../fixtures/app-fixtures");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_TEST } = require("../../config/config");

/*
 * Variables
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

/*
 * Tests
 */
describe("test quote and profile endpoints", function () {
	before("cleanup", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	before("insert users", async function () {
		await db.into("users").insert(makeUsersArray());
		// db.seed.run();  // TODO this causes the error "done() called multiple times in hook"
	});

	after("cleanup users", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});
	/* ****************************************************************************
	 *                               QUOTE ENDPOINTS                              *
	 **************************************************************************** */

	describe("test quote endpoints", function () {
		const badEndpoint = "/api/quote/bad";
		const malformedSymbolEndpoint = "/api/quote/AAPLXYZ";
		const missingSymbolEndpoint = "/api/quote";
		const validSymbolEndpoint = "/api/quote/AAPL";

		// - - - - - - - - - - - - - - - - - - - - -> ALLOW ACCESS TO A PROTECTED ROUTE
		it("should return quote data for a logged-in user", function (done) {
			const req = supertest.get(validSymbolEndpoint);
			req.set("Accept", "application/json");
			req.set({ Authorization: bearerToken });
			req.end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 200);
				assert.deepInclude(res.body, { status: "success" });
				assert.deepInclude(res.body.quote, { ticker: "AAPL" });
				assert.hasAllKeys(res.body.quote, makeQuoteKeysList());
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> DENY ACCESS TO A PROTECTED ROUTE
		it("should return a 401 for an unauthenticated user", function (done) {
			const req = supertest.get(validSymbolEndpoint);
			req.end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 401);
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - - - - -> NON-EXISTENT TICKER SYMBOL
		it("should return 'no match' for a logged-in user if no match to ticker is found", function (done) {
			const req = supertest.get(badEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 200);
					assert.deepInclude(res.body, { status: "no match" });
					done();
				});
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - -> NO TICKER SYMBOL PROVIDED
		it("should return a 404 for a logged-in user if no ticker symbol is provided", function (done) {
			const req = supertest.get(missingSymbolEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 404);
					done();
				});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> MALFORMED TICKER SYMBOL PROVIDED
		it("should return a 400 for a logged-in user if the provided ticker symbol is in an invalid format", function (done) {
			const req = supertest.get(malformedSymbolEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 400);
					assert.deepInclude(res.body, { status: "invalid symbol" });
					done();
				});
		});
	});

	/* ****************************************************************************
	 *                              PROFILE ENDPOINTS                             *
	 **************************************************************************** */

	describe("test profile endpoints", function () {
		const badProfileEndpoint = "/api/quote/bad/profile";
		const malformedProfileSymbolEndpoint = "/api/quote/AAPLXYZ/profile";
		const validProfileEndpoint = "/api/quote/AAPL/profile";

		// - - - - - - - - - - - - - - - - - - - - -> ALLOW ACCESS TO A PROTECTED ROUTE
		it("should return profile data for a logged-in user", function (done) {
			const req = supertest.get(validProfileEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 200);
					assert.deepInclude(res.body, { status: "success" });
					assert.deepInclude(res.body.profile, { ticker: "AAPL" });
					assert.hasAllKeys(res.body.profile, makeProfileKeysList());
					done();
				});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> DENY ACCESS TO A PROTECTED ROUTE
		it("should return a 401 for an unauthenticated user", function (done) {
			const req = supertest.get(validProfileEndpoint);
			// The reason this acts as expected is because we are not setting cookies
			req.set({ Accept: "application/json" }).end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 401);
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - - - - -> NON-EXISTENT TICKER SYMBOL
		it("should return 'no match' for a logged-in user if no match to ticker is found", function (done) {
			const req = supertest.get(badProfileEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 200);
					assert.deepInclude(res.body, { status: "no match" });
					done();
				});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> MALFORMED TICKER SYMBOL PROVIDED
		it("should return a 400 for a logged-in user if the provided ticker symbol is in an invalid format", function (done) {
			const req = supertest.get(malformedProfileSymbolEndpoint);
			req
				.set({ Authorization: bearerToken, Accept: "application/json" })
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 400);
					assert.deepInclude(res.body, { status: "invalid symbol" });
					done();
				});
		});
	});
});
