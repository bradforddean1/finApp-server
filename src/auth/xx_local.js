const LocalStrategy = require("passport-local").Strategy;

// const knex = require("../db/connection");

const options = {};

const localConfig = (passport, db) => {
  passport.use(
    new LocalStrategy(options, (username, password, done) => {
      // check to see if the username exists
      knex("users")
        .where({ username })
        .first()
        .then((user) => {
          if (!user) return done(null, false);
          if (!authHelpers.comparePass(password, user.password)) {
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
};

module.exports = localConfig;
