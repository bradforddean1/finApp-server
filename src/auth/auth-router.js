const authRouter = require("express").Router();
const xss = require("xss");
const { getHash, loginRequired, loginRedirect } = require("./helpers");
const passport = require("./passport-config");
const bodyParser = require("express").json();
const AuthService = require("./auth-service");

function handleResponse(res, code, statusMsg) {
	return res.status(code).json({ status: statusMsg });
}

authRouter.route("/register").post(
	bodyParser,
	loginRedirect,
	// Validate Request
	(req, res, next) => {
		const pass = req.body.password;
		if (pass.length < 6) {
			return res.status(400).json({
				status: "invalid password",
				valErrors: "Password must be at least 6 characters.",
			});
		}

		AuthService.findUserByUsername(xss(req.body.username)).then((response) => {
			if (response) {
				return handleResponse(res, 400, "user exists");
			} else {
				next();
			}
		});
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
	.post(bodyParser, loginRedirect, passport.authenticate("local"), function (
		req,
		res
	) {
		res.status(200).json({ status: "success" });
	});

authRouter.route("/logout").get(loginRequired, (req, res, next) => {
	console.log("rew at logout", req);
	req.logout();
	return handleResponse(res, 200, "success");
});

module.exports = authRouter;
