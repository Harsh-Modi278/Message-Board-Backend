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
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    require: true,
  },
};

/**
 * XXX Next.js FORCES the NODE_ENV to be either "development" or "production" at build time.
 * Because of this, we have a difference between the process.env.NODE_ENV given by Express and the on given by Next
 * In order to avoid this huge issue, we stored the real NODE_ENV in env.SERVER_ENV
 * And this config property must be used to get the NODE_ENV instead of process.env.NODE_ENV
 *
 * This function is compatible with Express/Next, and can be used anywhere, on the client and server.
 *
 * @returns {string}
 * @see XXX https://github.com/zeit/next.js/issues/3605#issuecomment-370255754
 */

const realNodeEnv = process.env.SERVER_ENV || process.env.NODE_ENV;
console.log({realNodeEnv});
const pool = new Pool(realNodeEnv === 'production' ? prodConfig : devConfig);

module.exports = pool;
