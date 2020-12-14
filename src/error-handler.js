/**
 * Error handler
 * @module
 */

const { NODE_ENV } = require("../config/config");
const logger = require("./logger");

/**
 * Top level error handler middleware for uncaught exceptions
 * @param {Object} error
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === "production") {
		response = { status: "server error" };
	} else {
		console.error(error);
		logger.error(error.message);
		response = { status: "server error", message: error.message, error };
	}
	res.status(500).json(response);
}

module.exports = errorHandler;
