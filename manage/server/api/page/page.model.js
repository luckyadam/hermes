'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  uri: String,
  type: String,
  enabled: { type: Boolean, default: true }
});
var PageSchema = new Schema({
  uri: {
    type: String,
    unique: true,
    index: true,
    require: true
  },
  description: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  createTime: Date,
  resources: [ResourceSchema],
  enabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('Page', PageSchema);
