const db = require("../../db/connection");
const logger = require("../logger");

module.exports = {
	/**
	 * Get ticker symbols mathcing user id from db portfolio_items table.
	 *
	 * @param {Number} userID
	 * @returns {Promise} - Resovles with array contianing the requested table rows.
	 */
	getTickersbyUser: (userID) => {
		return db.select("ticker").from("portfolio_items").where("user_id", userID);
	},

	/**
	 * Add row to db portfolio_items table.
	 *
	 * @param {Number} userID
	 * @param {String} ticker
	 * @returns {Promise} - Resovles with object with db row data, or object handles exception info.
	 * @throws {Error} - If knex query Promise rejects with an unhandled exeption.
	 */
	addTicker: (userID, ticker) => {
		return db
			.insert({
				user_id: userID,
				ticker: ticker,
			})
			.into("portfolio_items")
			.returning("*")
			.then((dbRes) => {
				logger.info(
					`new ticker ${ticker} added to protfolio for user ${userID}`
				);
				return dbRes;
			})
			.catch((err) => {
				if (err.code == 23505) {
					const errCode2 = new Error("ticker already exists for user");
					errCode2.code = 2;
					throw errCode2;
				} else {
					logger.error(err);
					throw new Error(
						`DB_ERROR -- unexpected database error when adding ${ticker} for user ID ${userID} to portfolio_items`
					);
				}
			});
	},
	/**
	 * Delete row from db portfolio_items table.
	 *
	 * @param {Number} userID
	 * @param {String} ticker
	 * @returns {Promise} - Resovles with db response: 0;
	 * @throws {Error} - If knex query Promise rejects
	 */
	deleteTicker: (userID, ticker) => {
		return db
			.from("portfolio_items")
			.where({
				user_id: userID,
				ticker: ticker,
			})
			.delete()
			.catch((err) => {
				logger.error(err);
				throw new Error(
					`DB_ERROR -- unexpected database error when adding ${ticker} for user ID ${userID} to portfolio_items`
				);
			});
	},
};
