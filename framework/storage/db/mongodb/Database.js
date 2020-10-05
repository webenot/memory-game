const Cursor = require('framework/storage/db/mongodb/Cursor');

require('dotenv').config();

module.exports = model => new Cursor(model);
