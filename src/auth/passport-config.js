/**
 * Config the passport object, login, serialize, and deserialize functions
 * @module
 */

const passport = require("passport");
const authHelpers = require("./helpers");
const AuthService = require("./auth-service");
const logger = require("../logger");
const {
	NODE_ENV,
	JWT_SECRET,
	JWT_SECRET_TEST,
} = require("../../config/config");
const jwtSecret = NODE_ENV === "test" ? JWT_SECRET_TEST : JWT_SECRET;

// Local strategy
const LocalStrategy = require("passport-local").Strategy;

// JWT Startegy
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy
const options = {};
passport.use(
	new LocalStrategy(options, (username, password, cb) => {
		AuthService.findUserByUsername(username)
			.then((user) => {
				if (!user) return cb(null, false);
				if (!authHelpers.comparePass(password, user.password)) {
					logger.info(`failed login attempt for user ${user.username}`);
					return cb(null, false);
				} else {
					return cb(null, user);
				}
			})
			.catch((err) => {
				return cb(err);
			});
	})
);

// JWT Strategy
passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtSecret,
		},
		(jwtPayload, cb) => {
			AuthService.findUserById(jwtPayload.user_id)
				.then((user) => {
					console.log("SUCCESS", user);
					if (!user) return cb(null, false);
					return cb(null, user);
				})
				.catch((err) => {
					console.log("FAIL", jwtPayload.user_id);
					return cb(err);
				});
		}
	)
);

module.exports = passport;
