const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const authHelpers = require("./helpers");
const AuthService = require("./auth-service");

const options = {};

passport.use(
	new LocalStrategy(options, (username, password, done) => {
		// check to see if the username exists
		console.log("Local Strategy Callback Function Start");

		AuthService.findUserByUsername(username)
			.then((user) => {
				console.log("Found User: ", user);
				if (!user) return done(null, false);
				if (!authHelpers.comparePass(password, user.password)) {
					return done(null, false);
				} else {
					console.log("password success!!!");
					return done(null, user);
				}
			})
			.catch((err) => {
				return done(err);
			});
	})
);

passport.serializeUser((user, done) => {
	console.log("user-serialize: ", user);
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	console.log("id-deserialize: ", id);

	AuthService.findUserById(id)
		.then((user) => {
			console.log("user found in deserialize function: ", user);

			done(null, user);
		})
		.catch((err) => {
			done(err, null);
		});
});

module.exports = passport;
