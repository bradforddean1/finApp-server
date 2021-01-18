describe("App", () => {
	// All Routes
	describe("Best practice headers in place", () => {
		it("X-Powered-By header is absent", () => {
			return supertest.get("/").then((res) => {
				assert.doesNotHaveAnyKeys(res.headers, "x-powered-by");
			});
		});
	});
});
