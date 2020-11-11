const passportStub = require("passport-stub");
const app = require("../../src/app");
const db = require("../../db/connection");

passportStub.install(app);

describe("GET /quote", () => {
	it("should return a quote", () => {
		const AAPL = {
			status: "success",
			quote: {
				country: "US",
				currency: "USD",
				exchange: "NASDAQ/NMS (GLOBAL MARKET)",
				ipo: "1980-12-12",
				marketCapitalization: 1415993,
				name: "Apple Inc",
				// phone: "14089961010",
				shareOutstanding: 4375.47998046875,
				ticker: "AAPL",
				weburl: "https://www.apple.com/",
				logo:
					"https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png",
				finnhubIndustry: "Technology",
			},
		};

		passportStub.login(1);

		return supertest(app)
			.get("/quote")
			.set("symbol", "AAPL")
			.expect(200, AAPL)
			.expect("Content-Type", "application/json; charset=utf-8");
	});

	it("should throw an error if a user is not logged in", () => {
		return supertest(app).get("/user").expect(401);
	});

	// client errors

	// graceful api errors
});
