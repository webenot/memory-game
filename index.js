const cluster = require('cluster');

require('dotenv').config();

if (cluster.isMaster) {
  require('framework/httpServer');
} else {
  require('framework/httpServer/worker.js');
  let db = null;
  if (process.env.DB_DRIVER) {
    db = require(`framework/storage/db/${process.env.DB_DRIVER}/Database`);
  }
  process.on('message', message => {
    if (message.index === 0 && process.env.DB_DRIVER === 'pg') {
      db.createAppTables();
    }
  });
}
