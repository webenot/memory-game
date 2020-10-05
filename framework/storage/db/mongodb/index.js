const mongoose = require('mongoose');

require('dotenv').config();

mongoose.Promise = global.Promise;

const db = mongoose.connection;

module.exports = db;
module.exports.disconnect = mongoose.disconnect;

const init = () => new Promise((resolve, reject) => {
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    socketTimeoutMS: 0,
    connectTimeoutMS: 0,
    keepAlive: true,
    promiseLibrary: global.Promise,
    poolSize: 5,
  };

  mongoose.connect(process.env.DB_HOST, mongoOptions);

  db.once('error', err => {
    reject(err);
  });

  db.once('open', () => {
    db.on('error', console.error);

    console.log(`MongoDB version: ${mongoose.version}`);

    resolve();
  });
});

init()
  .then(() => {
    console.log('MongoDB connection is running');
  });

module.exports.init = init;
