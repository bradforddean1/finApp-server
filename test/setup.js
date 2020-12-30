const { assert, expect } = require("chai");
const supertest = require("supertest");
const app = require("../src/app");
// const db = require("../db/connection");

global.assert = assert;
global.supertest = supertest(app);
global.app = require("../src/app");
// global.assert = db;
