/**
 * Express router for authorization endpoints
 * @module
 */

const authRouter = require("express").Router();
const xss = require("xss");
const { getHash, loginRequired, loginRedirect } = require("./helpers");
const passport = require("./passport-config");
const jwt = require("jsonwebtoken");
const bodyParser = require("express").json();
const AuthService = require("./auth-service");
const {
	NODE_ENV,
	JWT_SECRET,
	JWT_SECRET_TEST,
} = require("../../config/config");

const jwtSecret = NODE_ENV === "test" ? JWT_SECRET_TEST : JWT_SECRET;

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
				.then(() => {
					return handleResponse(res, 201, "success");
				})
				.catch(() => {
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
		function (req, res, next) {
			passport.authenticate("local", { session: false }, (err, user, info) => {
				if (err || !user) {
					return res.status(401).json({
						status: "Unautherized",
						user: user,
					});
				}
				req.login(user, { session: false }, (err) => {
					if (err) {
						res.send(err);
					}
					// generate a signed son web token with the contents of user object and return it in the response
					const token = jwt.sign({ user_id: user.id }, jwtSecret, {
						subject: user.username,
						algorithm: "HS256",
					});

					res.status(200).json({ status: "success", token });
				});
			})(req, res);
		}
	);

module.exports = authRouter;
