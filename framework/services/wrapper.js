const consoleLog = (...args) => {
  args = [ new Date().toISOString(), ...args ];
  console.log(args);
};

const consoleDir = (args, options = {}) => {
  console.dir(args, options);
};

const wrapFunction = (key, fn) => (...args) => {
  if (args.length > 0) {
    let callback = args[args.length - 1];
    if (typeof callback === 'function') {
      args[args.length - 1] = (...args) => {
        callback(...args);
      };
    } else {
      callback = null;
    }
  }
  return fn(...args);
};

const cloneInterface = anInterface => {
  const clone = {};
  for (const key in anInterface) {
    const fn = anInterface[key];
    clone[key] = wrapFunction(key, fn);
  }
  return clone;
};

const wrapRequire = name => {
  console.log(`${new Date().toISOString()} ${name}`);
  return require(name);
};

module.exports = {
  consoleLog,
  consoleDir,
  wrapFunction,
  wrapRequire,
  cloneInterface,
};
