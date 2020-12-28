// TODO
// `knex` looks for `knexfile.js` by default and exporting the different environments,
// as shown below, is common. However, only `npm run seed` uses this file. Creating,
// configuring, and seeding the database with a combination of `postrator-cli`, `psql`,
// and native `knex` commands is fragile. It would be much better to choose either
// `knex` or `postgrator-cli` to do all of this and cease implementation of the other.

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/finapp_dev',
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/development'
    }
  },

  production: {
    client: 'pg',
    connection: 'postgres://localhost/finapp_prod',
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/production'
    }
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/finapp_test',
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds/test'
    }
  }
}