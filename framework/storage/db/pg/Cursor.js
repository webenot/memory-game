const where = require('framework/storage/db/pg/where');

const MODE_ROWS = 0;
const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class Cursor {
  constructor (database, table) {
    this.database = database;
    this.table = table;
    this.cols = null;
    this.rows = null;
    this.rowCount = 0;
    this.ready = false;
    this.mode = MODE_ROWS;
    this.whereClause = undefined;
    this.columns = [ '*' ];
    this.args = [];
    this.orderBy = undefined;
    this.error = null;
    this.limitRecords = undefined;
    this.offsetRecords = undefined;
  }

  resolve (result) {
    if (!result) return;
    const { rows, fields, rowCount } = result;
    this.rows = rows;
    this.cols = fields;
    this.rowCount = rowCount;
  }

  reject (error) {
    this.error = error;
  }

  where (conditions) {
    const { clause, args } = where(conditions);
    this.whereClause = clause;
    this.args = args;
    return this;
  }

  fields (list) {
    this.columns = list;
    return this;
  }

  limit (limit) {
    this.limitRecords = limit;
    return this;
  }

  offset (offset) {
    this.offsetRecords = offset;
    return this;
  }

  value () {
    this.mode = MODE_VALUE;
    return this;
  }

  row () {
    this.mode = MODE_ROW;
    return this;
  }

  col (name) {
    this.mode = MODE_COL;
    this.columnName = name;
    return this;
  }

  count () {
    this.mode = MODE_COUNT;
    return this;
  }

  order (name) {
    this.orderBy = name;
    return this;
  }

  then (callback) {
    // TODO: store callback to pool
    const { mode, table, columns, args } = this;
    const { whereClause, orderBy, columnName, limitRecords, offsetRecords } = this;
    const fields = columns.join('", "');
    let sql = `SELECT "${fields}" FROM "${table}"`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (orderBy) sql += ` ORDER BY "${orderBy}"`;
    if (limitRecords) sql += ` LIMIT ${limitRecords}`;
    if (offsetRecords) sql += ` OFFSET ${offsetRecords}`;
    this.database.query(sql, args, (err, res) => {
      this.resolve(res);
      const { rows, cols } = this;
      if (mode === MODE_VALUE) {
        const col = cols[0];
        const row = rows[0];
        callback(row[col.name]);
      } else if (mode === MODE_ROW) {
        callback(rows[0]);
      } else if (mode === MODE_COL) {
        const col = [];
        for (const row of rows) {
          col.push(row[columnName]);
        }
        callback(col);
      } else if (mode === MODE_COUNT) {
        callback(this.rowCount);
      } else {
        callback(rows);
      }
    });
    return this;
  }

  catch (callback) {
    callback(this.error);
    return this;
  }

  finally (callback) {
    callback();
  }
}

module.exports = Cursor;
