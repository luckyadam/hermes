/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Dep = require('./dep.model');

exports.register = function(socket) {
  Dep.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Dep.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('dep:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('dep:remove', doc);
}