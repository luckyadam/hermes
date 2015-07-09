'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  id: Number,
  uri: String,
  type: String,
  enabled: Boolean
});

module.exports = mongoose.model('Resource', ResourceSchema);
