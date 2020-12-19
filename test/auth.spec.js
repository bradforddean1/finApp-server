const passportStub = require("passport-stub");
const app = require("../src/app");
const db = require("../db/connection");
const {
	makeUsersArray,
	makeMaliciousUser,
} = require("./fixtures/app-fixtures");

passportStub.install(app);

describe.skip("Auth endpoints", function () {
	before("cleanup", function () {
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	beforeEach("insert test users", function () {
		db.into("users").insert(makeUsersArray());
	});

	afterEach("cleanup users", function () {
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	after("disconnect from db", function () {
		// return db.destroy();
	});

	describe("POST /api/auth/register", function () {
		it("should register a new user", function () {
			return supertest(app)
				.post("/api/auth/register")
				.send({
					username: "frodo",
					password: "baggins",
				})
				.expect(201, { status: "success" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should throw an error if user exists", function () {
			return supertest(app)
				.post("/api/auth/register")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(400, { status: "user exists" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should throw an error if the password is < 6 characters", function () {
			const basPassRes = {
				status: "invalid password",
				valErrors: "Password must be at least 6 characters.",
			};
			return supertest(app)
				.post("/api/auth/register")
				.send({
					username: "larry",
					password: "short",
				})
				.expect(400, basPassRes)
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should stop an XSS attack", function () {
			const { maliciousUser, expectedUser } = makeMaliciousUser();
			return supertest(app)
				.post(`/api/auth/register`)
				.send(maliciousUser)
				.expect(201)
				.then(function () {
					db.select("*")
						.from("users")
						.where({ id: 4 })
						.first()
						.then((response) => {
							assert(response.username, expectedUser.username);
							assert(response.password, expectedUser.password);
						});
				});
		});
	});

	describe("POST /api/auth/login", function () {
		it("should login a user", function () {
			return supertest(app)
				.post("/api/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(200, { status: "success" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should not login an unregistered user", function () {
			return supertest(app)
				.post("/api/auth/login")
				.send({
					username: "sam",
					password: "johnson123",
				})
				.expect(401, { status: "unregistered" });
		});

		it("retruns 401 if login info not provided", function () {
			return supertest(app).post("/api/auth/login").send({}).expect(401);
		});

		it("should not login user with incorrect password", function () {
			return supertest(app)
				.post("/api/auth/login")
				.send({
					username: "steve",
					password: "badpassword",
				})
				.expect(401);
		});
		it("should throw an error if a user is logged in", function () {
			passportStub.login(1);
			return supertest(app)
				.post("/api/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(401, { status: "already logged in" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
	});

	describe("GET /api/auth/logout", function () {
		it("should logout a user", function () {
			// passportStub.login(1);

			return supertest(app)
				.post("/api/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.then(
					supertest(app)
						.get("/api/auth/logout")
						.expect(200, "success")
						.expect("Content-Type", "application/json")
				);
		});

		it("should throw an error if a user is not logged in", function () {
			return supertest(app).get("/api/auth/logout").expect(401);
		});
	});
});
