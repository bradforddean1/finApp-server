const db = require("../db/connection");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_TEST } = require("../config/config");
const {
	makeUsersArray,
	makeMaliciousUser,
} = require("./fixtures/app-fixtures");

describe("Auth endpoints", function () {
	/* ****************************************************************************
	 *                                AUTH ENDPOINTS                              *
	 ******************************************************************************
	 *
	 * -> Register
	 * -> Login
	 */

	const testUserId = 1;
	const testUserUsername = "steve";
	const testUserPassword = "johnson123";
	const authCreds = {
		password: testUserPassword,
		username: testUserUsername,
	};
	const invalidAuthCreds = {
		username: "steve",
		password: "badpassword",
	};
	const token = jwt.sign(
		{ user_id: testUserId }, // payload
		JWT_SECRET_TEST,
		{
			subject: testUserUsername,
			algorithm: "HS256",
		}
	);

	// Setup and Teardown
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
	 * Register
	 */
	const registerEndpoint = "/api/auth/register";

	describe("POST /api/auth/register", function () {
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

		it("returns 400 if user already exists", function () {
			return supertest(app)
				.post(registerEndpoint)
				.send(authCreds)
				.expect(400, { status: "user exists" })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

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
	const loginEndpoint = "/api/auth/login";

	describe("POST /api/auth/login", function () {
		//  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -> LOGIN A USER
		it("responds 200 and JWT auth token using secret when valid credentials", function () {
			return supertest(app)
				.post(loginEndpoint)
				.send(authCreds)
				.expect(200, { status: "success", token: token })
				.expect("Content-Type", "application/json; charset=utf-8");
		});

		it("should return 401 for an unregistered user", function () {
			return supertest(app)
				.post(loginEndpoint)
				.send({
					username: "sam",
					password: "johnson123",
				})
				.expect(401, { status: "unregistered" });
		});

		it("retruns 401 if login info not provided", function () {
			return supertest(app).post(loginEndpoint).send({}).expect(401);
		});

		it("should not login user with incorrect password", function () {
			return supertest(app)
				.post(loginEndpoint)
				.send(invalidAuthCreds)
				.expect(401);
		});
	});
});
