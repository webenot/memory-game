const createTable = (tableName, fields) => {
  let query = `CREATE TABLE IF NOT EXISTS "${tableName}" (`;
  const queryFields = [];
  if (!fields.hasOwnProperty('ID')) {
    queryFields.push('"ID" SERIAL NOT NULL PRIMARY KEY UNIQUE');
  }
  for (const field in fields) {
    if (fields.hasOwnProperty(field)) {
      let q = `"${field}" `;
      if (field === 'ID') {
        q += 'SERIAL NOT NULL PRIMARY KEY UNIQUE';
      } else {
        if (fields[field].type) {
          q += `${fields[field].type}`;
        } else {
          q += 'TEXT';
        }
        if (fields[field].required) {
          q += ' NOT NULL';
        }
        if (fields[field].default !== undefined) {
          let defaultValue;
          if (typeof fields[field].default === 'function') {
            defaultValue = fields[field].default();
          } else {
            defaultValue = fields[field].default;
          }
          if (typeof defaultValue === 'string') {
            q += ` DEFAULT $$${defaultValue}$$`;
          } else if (typeof defaultValue === 'number') {
            q += ` DEFAULT ${defaultValue}`;
          } else {
            q += ` DEFAULT $$${JSON.stringify(defaultValue)}$$`;
          }
        }
        if (fields[field].unique) {
          q += ' UNIQUE';
        }
        if (fields[field].check) {
          q += ` check ("${field}" ${fields[field].check})`;
        }
      }
      queryFields.push(q);
    }
  }
  query += `${queryFields.join(',')});`;
  return query;
};

module.exports = createTable;
