const db = require("../db/connection");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_TEST } = require("../config/config");
const {
	makeUsersArray,
	makeMaliciousUser,
} = require("./fixtures/app-fixtures");

describe("Auth endpoints", function () {
	before("cleanup", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	beforeEach("insert test users", async function () {
		await db.into("users").insert(makeUsersArray());
	});

	afterEach("cleanup users", async function () {
		await db.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	});

	/*
	 * AUTH ENDPOINTS
	 * -> Register
	 * -> Login
	 * -> Logout
	 */
	const testUserId = 1;
	const testUserUsername = "steve";
	const testUserPassword = "johnson123";
	const authCreds = {
		password: testUserPassword,
		username: testUserUsername,
	};

	/*
	 * Register
	 */
	describe("POST /api/auth/register", function () {
		const registerEndpoint = "/api/auth/register";

		//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -> REGISTER A USER
		it("should register a new user", function () {
			return supertest(app)
				.post(registerEndpoint)
				.send({
					username: "frodo",
					password: "baggins",
				})
				.expect(201, { status: "success" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		//  - - - - - - - - - - - - -- - - - - - - -> DENY REGISTRATION TO AN EXISTING USER
		it("returns 400 if user already exists", function () {
			return supertest(app)
				.post(registerEndpoint)
				.send(authCreds)
				.expect(400, { status: "user exists" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		//  - - - - - - - - _- - - - - - -> DENY REGISTRATION IF CREDENTIALS FAIL VALIDATION
		it("should return 400 if the password is < 6 characters", function () {
			const basPassRes = {
				status: "invalid password",
				valErrors: "Password must be at least 6 characters.",
			};
			return supertest(app)
				.post(registerEndpoint)
				.send({
					username: "larry",
					password: "short",
				})
				.expect(400, basPassRes)
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -> HANDLE XSS ATTACK
		it("should stop an XSS attack", function () {
			const { maliciousUser, expectedUser } = makeMaliciousUser();
			return supertest(app)
				.post(registerEndpoint)
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

	/*
	 * Login
	 */
	describe.only("POST /api/auth/login", function () {
		const loginEndpoint = "/api/auth/login";
		const invalidAuthCreds = {
			username: "steve",
			password: "badpassword",
		};

		//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -> LOGIN A USER
		it("responds 200 and JWT auth token using secret when valid credentials", function () {
			const expectedToken = jwt.sign(
				{ user_id: testUserId }, // payload
				JWT_SECRET_TEST,
				{
					subject: testUserUsername,
					algorithm: "HS256",
				}
			);

			return supertest(app)
				.post(loginEndpoint)
				.send(authCreds)
				.expect(200, { status: "success", authToken: expectedToken })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 401 for an unregistered user", function () {
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
				.send(invalidAuthCreds)
				.expect(401);
		});

		it("should throw an error if a user is logged in", function () {
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
