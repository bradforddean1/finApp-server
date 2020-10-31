const quoteRouter = require("express").Router();
const { loginRequired } = require("../auth/helpers");

quoteRouter.route("/").get(loginRequired, (req, res, next) => {
	return res.status(200).json({ status: "success" });
});

module.exports = quoteRouter;
