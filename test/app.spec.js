const app = require("../src/app");
const passportStub = require("passport-stub");

passportStub.install(app);

describe("App", () => {
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
});
