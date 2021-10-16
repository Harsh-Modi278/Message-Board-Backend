const Pool = require("pg").Pool;

const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

const devConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
};

const prodConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig);

module.exports = pool;
