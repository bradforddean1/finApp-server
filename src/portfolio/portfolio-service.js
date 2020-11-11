const db = require("../../db/connection");
const logger = require("../logger");

module.exports = {
	getTickersbyUser: (userID) => {
		return db.select("ticker").from("portfolio_items").where("user_id", userID);
	},
	addTicker: (userID, ticker) => {
		return db
			.insert({
				user_id: userID,
				ticker: ticker,
			})
			.into("portfolio_items")
			.returning("*")
			.catch((err) => {
				if (err.code == 23505) {
					return {
						error: true,
						code: 1,
						message: "ticker already exists for user",
					};
				} else {
					logger.error(
						`unexpected database error when adding ${ticker} for user ID ${userID} to portfolio_items: ${err}`
					);
					return {
						error: true,
						code: 2,
						message: "database error",
					};
				}
			});
	},
	deleteTicker: (userID, ticker) => {
		return db
			.from("portfolio_items")
			.where({
				user_id: userID,
				ticker: ticker,
			})
			.delete()
			.catch((err) => {
				logger.error(
					`unexpected database error when deleting ${ticker} for user ID ${userID} to portfolio_items: ${err}`
				);
				return {
					error: true,
					code: 2,
					message: "database error",
				};
			});
	},
};
