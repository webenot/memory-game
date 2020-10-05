const db = require('framework/storage/db/pg/Database');

require('dotenv').config();

const pg = db.open({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'test-db',
  dbPrefix: process.env.DB_PREFIX || 'lt_',
});

module.exports = pg;
