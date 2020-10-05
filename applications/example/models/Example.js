const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExampleSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  description: String,
});

module.exports = mongoose.model('Example', ExampleSchema);
