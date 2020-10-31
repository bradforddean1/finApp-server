const userRouter = require("express").Router();
const { loginRequired } = require("../auth/helpers");
const UserService = require("./user-service");

userRouter.route("/").get(loginRequired, (req, res, next) => {
	return res.status(200).json({ status: "success" });
});

module.exports = userRouter;
