const db = require("../db/connection");
const {
	makeQuoteKeysList,
	makeProfileKeysList,
} = require("./fixtures/app-fixtures");

describe("test quote and profile endpoints", function () {
	before("cleanup", function () {
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	before("insert users", function () {
		// db.seed.run();  // TODO this causes the error "done() called multiple times in hook"
	});

	after("disconnect from db", function () {
		// db.destroy();
	});

	let Cookies;

	/* ****************************************************************************
	 *                               QUOTE ENDPOINTS                               *
	 **************************************************************************** */
	describe("test quote endpoints", function () {
		const authCreds = { password: "johnson123", username: "steve" };
		const authEndpoint = "/api/auth/login";
		const badEndpoint = "/api/quote/bad";
		const malformedSymbolEndpoint = "/api/quote/AAPLXYZ";
		const missingSymbolEndpoint = "/api/quote";
		const validSymbolEndpoint = "/api/quote/AAPL";

		//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -> LOGIN A USER
		// We use this to set cookies which the other tests in this file need access to
		it("should login a user and store the session in a cookie", function (done) {
			supertest
				.post(authEndpoint)
				.set("Content-type", "application/json")
				.send(authCreds)
				.end(function (err, res) {
					if (err) return done(err);
					assert.equal(res.status, 200);
					Cookies = res.header["set-cookie"];
					done();
				});
		});

		// - - - - - - - - - - - - - - - - - - - - -> ALLOW ACCESS TO A PROTECTED ROUTE
		it("should return quote data for a logged-in user", function (done) {
			const req = supertest.get(validSymbolEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
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
			// The reason this acts as expected is because we are not setting cookies
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 401);
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - - - - -> NON-EXISTENT TICKER SYMBOL
		it("should return 'no match' for a logged-in user if no match to ticker is found", function (done) {
			const req = supertest.get(badEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 200);
				assert.deepInclude(res.body, { status: "no match" });
				done();
			});
		});

		// - - - - - - - - - - - - - - - - - - - - - - - - -> NO TICKER SYMBOL PROVIDED
		it("should return a 404 for a logged-in user if no ticker symbol is provided", function (done) {
			const req = supertest.get(missingSymbolEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 404);
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> MALFORMED TICKER SYMBOL PROVIDED
		it("should return a 400 for a logged-in user if the provided ticker symbol is in an invalid format", function (done) {
			const req = supertest.get(malformedSymbolEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 400);
				assert.deepInclude(res.body, { status: "invalid symbol" });
				done();
			});
		});
	});

	/* ****************************************************************************
	 *                              PROFILE ENDPOINTS                              *
	 **************************************************************************** */
	describe("test profile endpoints", function () {
		const badProfileEndpoint = "/api/quote/bad/profile";
		const malformedProfileSymbolEndpoint = "/api/quote/AAPLXYZ/profile";
		const validProfileEndpoint = "/api/quote/AAPL/profile";

		// - - - - - - - - - - - - - - - - - - - - -> ALLOW ACCESS TO A PROTECTED ROUTE
		it("should return profile data for a logged-in user", function (done) {
			const req = supertest.get(validProfileEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
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
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 401);
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - - - - -> NON-EXISTENT TICKER SYMBOL
		it("should return 'no match' for a logged-in user if no match to ticker is found", function (done) {
			const req = supertest.get(badProfileEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 200);
				assert.deepInclude(res.body, { status: "no match" });
				done();
			});
		});

		//  - - - - - - - - - - - - - - - - - - - - -> MALFORMED TICKER SYMBOL PROVIDED
		it("should return a 400 for a logged-in user if the provided ticker symbol is in an invalid format", function (done) {
			const req = supertest.get(malformedProfileSymbolEndpoint);
			req.cookies = Cookies;
			req.set("Accept", "application/json").end(function (err, res) {
				if (err) return done(err);
				assert.equal(res.status, 400);
				assert.deepInclude(res.body, { status: "invalid symbol" });
				done();
			});
		});
	});
});
