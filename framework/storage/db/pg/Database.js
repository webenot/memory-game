const fs = require('fs');
const { Pool } = require('pg');

const Cursor = require('framework/storage/db/pg/Cursor');
const createTableQuery = require('framework/storage/db/pg/methods/createTableQuery');

class Database {
  constructor (config, logger) {
    this.pool = new Pool(config);
    this.config = config;
    this.logger = logger;
    this.tables = [];

    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      client.release(true);
    });

    this.getTableList()
      .then(list => {
        this.tables = list;
      });
  }

  query (sql, values, callback) {
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }
    const startTime = new Date().getTime();
    this.pool.query(sql, values, (err, res) => {
      const endTime = new Date().getTime();
      const executionTime = endTime - startTime;
      console.log(`Execution time: ${executionTime}ms`);
      if (callback) callback(err, res);
    });
  }

  select (table) {
    return new Cursor(this, table);
  }

  close () {
    this.pool.end();
  }

  createTable (tableName, fields) {
    tableName = `${this.config.dbPrefix}${tableName}`;
    return this.select('pg_tables')
      .where({
        tableowner: this.config.user,
        schemaname: 'public',
        tableName,
      })
      .fields([ 'tablename' ])
      .limit(1)
      .then(async rows => {
        if (!rows || !rows.length) {
          const tableQuery = createTableQuery(tableName, fields);
          this.query(tableQuery, [], async () => {
            this.tables = await this.getTableList();
            for (const field in fields) {
              if (fields.hasOwnProperty(field)) {
                if (fields[field].index) {
                  await this.createIndex(tableName, field);
                }
                if (fields[field].reference) {
                  await this.createForeignIndex(tableName, field, fields[field].reference);
                }
              }
            }
          });
        }
      });
  }

  getTableList () {
    return new Promise(resolve => {
      this.select('pg_tables')
        .where({
          tableowner: this.config.user,
          schemaname: 'public',
        })
        .fields([ 'tablename' ])
        .order('tablename')
        .then(rows => {
          const list = [];
          for (const table of rows) {
            list.push(table.tablename);
          }
          resolve(list);
        });
    });
  }

  async createAppTables () {
    const models = fs.readdirSync(
      `applications/${process.env.CURRENT_APP}/models`).filter(model => model !== 'index.js',
    );
    for (const model of models) {
      const modelClass = require(`applications/${process.env.CURRENT_APP}/models/${model}`).tableData();
      await this.createTable(modelClass.tableName, modelClass.fields);
    }
  }

  async createIndex (tableName, fieldName) {
    if (!tableName || !fieldName) return;
    const indexQuery =
      `CREATE INDEX CONCURRENTLY "${tableName}_${fieldName}_index" ON` +
      `"${tableName}" ("${fieldName}");`;
    this.query(indexQuery, [], () => {});
  }

  async createForeignIndex (tableName, field, reference) {
    if (!tableName || !field || !reference) return;
    const referenceQuery =
      `ALTER TABLE "${tableName}"` +
      `ADD CONSTRAINT "fk${tableName}${field}"` +
      ` FOREIGN KEY ("${field}") REFERENCES "${reference.table}"` +
      `("${reference.field}") ON DELETE ${reference.onDelete};`;
    this.query(referenceQuery, [], () => {});
  }
}

module.exports = { open: (config, logger) => new Database(config, logger) };
