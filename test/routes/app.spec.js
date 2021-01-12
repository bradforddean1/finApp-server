const supertest = require("supertest");

describe("App", () => {
	// All Routes
	describe("Best practice headers in place", () => {
		it("X-Powered-By header is absent", () => {
			return supertest(app)
				.get("/")
				.then((res) => {
					assert.doesNotHaveAnyKeys(res.headers, "x-powered-by");
				});
		});
	});
});
