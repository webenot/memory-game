module.exports = conditions => {
  let clause = '';
  const args = [];
  let i = 1;
  for (const key in conditions) {
    let value = conditions[key];
    let condition;
    if (typeof value === 'number') {
      condition = `"${key}" = $${i}`;
    } else if (typeof value === 'string') {
      if (value.startsWith('>=')) {
        condition = `"${key}" >= $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('<=')) {
        condition = `"${key}" <= $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('<>')) {
        condition = `"${key}" <> $${i}`;
        value = value.substring(2);
      } else if (value.startsWith('>')) {
        condition = `"${key}" > $${i}`;
        value = value.substring(1);
      } else if (value.startsWith('<')) {
        condition = `"${key}" < $${i}`;
        value = value.substring(1);
      } else if (value.includes('*') || value.includes('?')) {
        value = value.replace(/\*/g, '%').replace(/\?/g, '_');
        condition = `"${key}" LIKE $${i}`;
      } else {
        condition = `"${key}" = $${i}`;
      }
    }
    i++;
    args.push(value);
    clause = clause ? `${clause} AND ${condition}` : condition;
  }
  return {
    clause,
    args,
  };
};
