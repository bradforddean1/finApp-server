const passportStub = require("passport-stub");
const app = require("../src/app");
const db = require("../db/connection");
const {
	makeUsersArray,
	makeMaliciousUser,
} = require("./fixtures/app-fixtures");

passportStub.install(app);

describe("Auth endpoints", () => {
	before("cleanup", () =>
		db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	);

	beforeEach("insert test users", () => {
		return db.into("users").insert(makeUsersArray());
	});

	afterEach("cleanup users", function () {
		return db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	after("disconnect from db", () => {
		// return db.destroy();
	});

	describe("POST /auth/register", () => {
		it("should register a new user", () => {
			return supertest(app)
				.post("/auth/register")
				.send({
					username: "frodo",
					password: "baggins",
				})
				.expect(201, { status: "success" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should throw an error if user exists", () => {
			return supertest(app)
				.post("/auth/register")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(400, { status: "user exists" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should throw an error if the password is < 6 characters", () => {
			const basPassRes = {
				status: "invalid password",
				valErrors: "Password must be at least 6 characters.",
			};
			return supertest(app)
				.post("/auth/register")
				.send({
					username: "larry",
					password: "short",
				})
				.expect(400, basPassRes)
				.expect("Content-Type", "application/json; charset=utf-8");
		});
		it("should stop an XSS attack", () => {
			const { maliciousUser, expectedUser } = makeMaliciousUser();
			return supertest(app)
				.post(`/auth/register`)
				.send(maliciousUser)
				.expect(201)
				.then(() => {
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

	describe("POST /auth/login", () => {
		it("should login a user", () => {
			return supertest(app)
				.post("/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(200, { status: "success" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should not login an unregistered user", () => {
			return supertest(app)
				.post("/auth/login")
				.send({
					username: "sam",
					password: "johnson123",
				})
				.expect(401);
		});

		it("retruns 400 if login info not provided", () => {
			return supertest(app).post("/auth/login").send({}).expect(400);
		});

		it("should not login user with incorrect password", () => {
			return supertest(app)
				.post("/auth/login")
				.send({
					username: "steve",
					password: "badpassword",
				})
				.expect(401);
		});
		it("should throw an error if a user is logged in", () => {
			passportStub.login(1);
			return supertest(app)
				.post("/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.expect(401, { status: "You are already logged in" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});
	});

	describe("GET /auth/logout", () => {
		it.skip("should logout a user", () => {
			// passportStub.login(1);

			return supertest(app)
				.post("/auth/login")
				.send({
					username: "steve",
					password: "johnson123",
				})
				.then(
					supertest(app)
						.get("/auth/logout")
						.expect(200, "success")
						.expect("Content-Type", "application/json")
				);
		});

		it("should throw an error if a user is not logged in", () => {
			return supertest(app).get("/auth/logout").expect(401);
		});
	});
});
