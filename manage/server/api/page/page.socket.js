/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Page = require('./page.model');

exports.register = function(socket) {
  Page.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Page.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('page:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('page:remove', doc);
}