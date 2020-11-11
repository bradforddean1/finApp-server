const portfolioRouter = require("express").Router();
const { loginRequired } = require("../auth/helpers");

portfolioRouter.route("/").get(loginRequired, (req, res, next) => {
	return res.status(200).json({
		status: "success",
	});
});

module.exports = portfolioRouter;
