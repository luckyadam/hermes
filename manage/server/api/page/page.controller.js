'use strict';

var _ = require('lodash');
var Page = require('./page.model');

// Get list of pages
exports.index = function(req, res) {
  Page.find(function (err, pages) {
    if(err) { return handleError(res, err); }
    return res.json(200, {
      no: 0,
      errmsg: '成功',
      data: pages
    });
  });
};

// Get a single page
exports.show = function(req, res) {
  Page.findById(req.params.id, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    return res.json({
      no: 0,
      errmsg: '成功',
      data: page
    });
  });
};

// Creates a new page in the DB.
exports.create = function(req, res) {
  Page.create(req.body, function(err, page) {
    page.resources.create(req.body.resources);
    if(err) { return handleError(res, err); }
    return res.json(201, page);
  });
};

// Updates an existing page in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Page.findById(req.params.id, function (err, page) {
    if (err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    var updated = _.merge(page, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, page);
    });
  });
};

// Deletes a page from the DB.
exports.destroy = function(req, res) {
  Page.findById(req.params.id, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    page.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
