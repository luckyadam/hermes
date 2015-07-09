/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Resource = require('./resource.model');

exports.register = function(socket) {
  Resource.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Resource.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('resource:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('resource:remove', doc);
}