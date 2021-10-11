const Pool = require("pg").Pool;

const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: "localhost",
  port: "5432",
});

module.exports = pool;
