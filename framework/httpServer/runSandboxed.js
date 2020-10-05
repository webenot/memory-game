const fs = require('fs');
const vm = require('vm');
const sandboxedFs = require('sandboxed-fs');

require('dotenv').config();

const { consoleLog, consoleDir, wrapRequire, cloneInterface } = require('framework/services/wrapper');
let db = null;
if (process.env.DB_DRIVER) {
  db = require(`framework/storage/db/${process.env.DB_DRIVER}/Database`);
}

module.exports = (path, { query, params, render }, contextOut = {}) => {
  const normalPath = `applications/${process.env.CURRENT_APP}/routes${path === '/' ? '' : path}`;
  const stats = fs.existsSync(`${normalPath}.js`);
  let fileName = normalPath;
  if (!stats) {
    fileName += '/index.js';
  } else {
    fileName += '.js';
  }
  const context = Object.assign({
    console: {
      log: consoleLog,
      dir: consoleDir,
    },
    require: wrapRequire,
    fs: cloneInterface(sandboxedFs.bind(normalPath)),
    JSON: {
      parse: str => JSON.parse(str),
      stringify: obj => JSON.stringify(obj),
    },
  }, contextOut);
  context.global = context;
  const sandbox = vm.createContext(context);
  return new Promise(resolve => {
    // Read an application source code from the file
    fs.readFile(fileName, (err, src) => {
      // We need to handle errors here
      if (err) resolve(false);

      // Run an application in sandboxed context
      const script = new vm.Script(src, fileName);
      const f = script.runInNewContext(sandbox);
      if (f) resolve(f({ query, params, render, db }));
      resolve(false);
      // We can access a link to exported interface from sandbox.module.exports
      // to execute, save to the cache, print to console, etc.
    });
  });
};
