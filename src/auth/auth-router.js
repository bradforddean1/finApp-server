/**
 * Express router for authorization endpoints
 * @module
 */

const authRouter = require("express").Router();
const xss = require("xss");
const { getHash, loginRequired, loginRedirect } = require("./helpers");
const passport = require("./passport-config");
const bodyParser = require("express").json();
const AuthService = require("./auth-service");

function handleResponse(res, code, statusMsg) {
	return res.status(code).json({ status: statusMsg });
}

authRouter
	.route("/register")
	/**
	 * Register a new user
	 *
	 * @name Register - New User
	 * @route {POST} /auth/register
	 * @authentication This route does not require authentication
	 */
	.post(
		bodyParser,
		loginRedirect,
		// Validate Request
		(req, res, next) => {
			const pass = req.body.password;
			if (!pass || pass.length < 6) {
				return res.status(400).json({
					status: "invalid password",
					valErrors: "Password must be at least 6 characters.",
				});
			}

			AuthService.findUserByUsername(xss(req.body.username)).then(
				(response) => {
					if (response) {
						return handleResponse(res, 400, "user exists");
					} else {
						next();
					}
				}
			);
		},
		// Add User
		(req, res, next) => {
			const hash = getHash(req.body.password);
			AuthService.createUser(xss(req.body.username), hash)
				.then((response) => {
					return handleResponse(res, 201, "success");
				})
				.catch((err) => {
					return handleResponse(res, 500, "error");
				});
		}
	);

authRouter
	.route("/login")
	/**
	 * Login a user
	 *
	 * @name Login
	 * @route {POST} /auth/login
	 * @authentication This route does not require authentication
	 */
	.post(
		bodyParser,
		loginRedirect,
		function (req, res, next) {
			console.log("Response: ", req.body.username);

			AuthService.findUserByUsername(xss(req.body.username)).then(
				(response) => {
					if (response) {
						next();
					} else {
						return handleResponse(res, 401, "unregistered");
					}
				}
			);
		},
		passport.authenticate("local"),
		function (req, res) {
			passport.authenticate("local");
			res.status(200).json({ status: "success" });
		}
	);

authRouter
	.route("/logout")
	/**
	 * Logout a user
	 *
	 * @name Logout
	 * @route {GET} /auth/logout
	 * @authentication This route requires oAuth Authentication. If authentication fails it will return a 401 error.
	 */ .get(loginRequired, (req, res, next) => {
		req.logout();
		return handleResponse(res, 200, "success");
	});

module.exports = authRouter;
