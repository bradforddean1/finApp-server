const { assert } = require("chai");
const supertest = require("supertest");
const supertestSession = require('supertest-session');
// const app = require("../src/app");
// const db = require("../db/connection");

global.assert = assert;
global.supertest = supertest;
global.supertestSession = supertestSession;
// global.app = require("../src/app");
// global.assert = db;
