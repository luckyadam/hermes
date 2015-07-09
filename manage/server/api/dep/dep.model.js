'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepSchema = new Schema({
  uri: {
    type: String,
    unique: true,
    index: true,
    require: true
  },
  description: String,
  product: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  createTime: Date,
  dep: [{ type: Schema.Types.ObjectId, ref: 'Page' }]
});

module.exports = mongoose.model('Dep', DepSchema);
