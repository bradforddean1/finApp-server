const app = require("../src/app");

describe("Express app", () => {
  it("should do something", () => {
      return supertest(app)
        .get("/")
        .expect(200, "Hello Express!");
  });
});

describe("support for CORS and best practice headers in place", () => {
    it("returns Access-Control-Allow-Origin header", () => {
      return supertest(app)
        .get("/")
        .expect("Access-Control-Allow-Origin", "*");
    });
    it("X-Powered-By header is absent", () => {
      return supertest(app)
        .get("/")
        .then((res) => {
          assert.doesNotHaveAnyKeys(res.headers, "x-powered-by");
        });
    });
  });
