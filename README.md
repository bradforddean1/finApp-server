1. Clone this repository to your local machine.
* `git clone https://github.com/bradforddean1/finApp-server.git`
1. Install NPM dependencies.
* `cd finApp-server`
* `npm install`
1. Configure a local database.
* Start your local database server with either `pg_ctl status` or `brew services start postgresql`
* `npm run db:create:dev`
* `npm run migrate`
1. Seed the local database.
* `npm run seed`
1. Start the server.
* `npm run start`
1. Test an **auth** endpoint in Postman.
* Make a POST request to `http://localhost:8000/api/auth/login` with the following body and with type `JSON`.
```json
{
    "username": "demo",
    "password": "testing123"
}
```
1. You should now be successfully authenticated. Make a GET request to `http://localhost:8000/api/quote/AAPL` to see the the details of Apple's stock.
1. Lastly, make a GET request to `http://localhost:8000/api/auth/logout` in order to logout.