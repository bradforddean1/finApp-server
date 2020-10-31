const app = require("../src/app");
const db = require("../db/connection");
const fixtures = require("./fixtures/app-fixtures");
const passportStub = require("passport-stub");

passportStub.install(app);

describe.only("App", () => {
	// Common setup and teardown
	before("cleanup", () => db("users").truncate());
	beforeEach("insert users", () => {
		return db.seed.run();
	});
	afterEach("cleanup", () => db("users").truncate());
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

	// Route Tests
	describe("app endpoints", () => {
		require("./specs/auth.spec");
		require("./specs/user.spec");
	});
});
