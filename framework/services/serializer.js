module.exports = {
  object: JSON.stringify,
  string: s => s,
  number: n => n.toString(),
  undefined: () => 'Not found',
  function: (fn, par, client) => JSON.stringify(fn(client, par)),
};
