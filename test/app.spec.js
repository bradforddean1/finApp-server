const app = require("../src/app");
const db = require("../db/connection");
const passportStub = require("passport-stub");

passportStub.install(app);

describe("App", () => {
	// Common setup and teardown
	before("cleanup", () => db.raw("TRUNCATE TABLE users CASCADE"));
	before("insert users", () => {
		return db.seed.run();
	});
	afterEach("logout", () => passportStub.logout());
	after("disconnect from db", () => db.destroy());

	// All Routes
	describe("support for CORS and best practice headers in place", () => {
		it("returns Access-Control-Allow-Origin header", () => {
			return supertest(app).get("/").expect("Access-Control-Allow-Origin", "*");
		});

		it("X-Powered-By header is absent", () => {
			return supertest(app)
				.get("/")
				.then((res) => {
					assert.doesNotHaveAnyKeys(res.headers, "x-powered-by");
				});
		});
	});

	// Route Specs
	// describe("app endpoints", () => {
	// 	require("./specs/auth.spec");
	// 	require("./specs/user.spec");
	// 	require("./specs/quote.spec");
	// });
});
