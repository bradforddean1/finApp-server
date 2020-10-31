const passportStub = require("passport-stub");
const app = require("../../src/app");
const db = require("../../db/connection");

passportStub.install(app);

describe("GET /user", () => {
	it("should return a success", () => {
		passportStub.login(1);
		return supertest(app)
			.get("/user")
			.expect(200, { status: "success" })
			.expect("Content-Type", "application/json; charset=utf-8");
	});

	it("should throw an error if a user is not logged in", () => {
		return supertest(app).get("/user").expect(401);
	});
});
