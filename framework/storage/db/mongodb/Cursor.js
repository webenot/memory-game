require('dotenv').config();

class Cursor {
  constructor (model) {
    this.model = require(`applications/${process.env.CURRENT_APP}/models/${model}.js`);
    this.query = null;
    this.error = null;
  }

  find (conditions, select = '') {
    conditions = conditions || {};
    try {
      this.query = this.model.find(conditions, select);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  findOne (conditions, select = '') {
    conditions = conditions || {};
    try {
      this.query = this.model.findOne(conditions, select);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  sort (sortBy) {
    sortBy = sortBy || null;
    if (!sortBy) return this;
    try {
      this.query.sort(sortBy);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  offset (offset) {
    offset = offset || 0;
    try {
      this.query.skip(offset);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  limit (limit) {
    limit = limit || 0;
    if (!limit) return this;
    try {
      this.query.limit(limit);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  then (callback) {
    if (this.query) {
      this.query.then(callback);
    }
    return this;
  }

  catch (callback) {
    callback(this.error);
    return this;
  }

  finally (callback) {
    callback();
  }

  count () {
    this.query.countDocuments();
    return this;
  }

  async save (data = {
    findBy: null,
    item: {},
  }) {
    if (data.findBy) {
      const exists = await this.findOne(data.findBy);
      if (exists) return exists;
    }
    const modelDocument = new this.model(data.item);
    try {

      await modelDocument.save();

      return modelDocument;

    } catch (e) {
      this.error = e;
      console.error(e);
      return null;
    }
  }

  deleteOne (where) {
    where = where || {};
    try {
      this.query = this.model.deleteOne(where);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

  updateOne (data = {
    findBy: null,
    update: {},
  }) {
    try {
      this.query = this.model.updateOne(data.findBy, data.update);
    } catch (e) {
      this.error = e;
    }
    return this;
  }
}

module.exports = Cursor;
