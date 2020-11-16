/**
 * Config the passport object, login, serialize, and deserialize functions
 * @module
 */

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const authHelpers = require("./helpers");
const AuthService = require("./auth-service");
const logger = require("../logger");

const options = {};

passport.use(
	new LocalStrategy(options, (username, password, done) => {
		AuthService.findUserByUsername(username)
			.then((user) => {
				if (!user) return done(null, false);
				if (!authHelpers.comparePass(password, user.password)) {
					logger.info(`failed login attempt for user ${user}`);

					return done(null, false);
				} else {
					return done(null, user);
				}
			})
			.catch((err) => {
				return done(err);
			});
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	AuthService.findUserById(id)
		.then((user) => {
			done(null, user);
		})
		.catch((err) => {
			done(err, null);
		});
});

module.exports = passport;
