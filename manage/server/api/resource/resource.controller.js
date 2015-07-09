/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /resources              ->  index
 * POST    /resources              ->  create
 * GET     /resources/:id          ->  show
 * PUT     /resources/:id          ->  update
 * DELETE  /resources/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Resource = require('./resource.model');

// Get list of resources
exports.index = function(req, res) {
  Resource.find(function (err, resources) {
    if(err) { return handleError(res, err); }
    return res.json(200, resources);
  });
};

// Get a single resource
exports.show = function(req, res) {
  Resource.find({ id: req.params.id }, function (err, resource) {
    if(err) { return handleError(res, err); }
    if(!resource) { return res.send(404); }
    return res.json(resource);
  });
};

// Creates a new resource in the DB.
exports.create = function(req, res) {
  Resource.create(req.body, function(err, resource) {
    if(err) { return handleError(res, err); }
    return res.json(201, resource);
  });
};

// Updates an existing resource in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Resource.findById(req.params.id, function (err, resource) {
    if (err) { return handleError(res, err); }
    if(!resource) { return res.send(404); }
    var updated = _.merge(resource, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, resource);
    });
  });
};

// Deletes a resource from the DB.
exports.destroy = function(req, res) {
  Resource.findById(req.params.id, function (err, resource) {
    if(err) { return handleError(res, err); }
    if(!resource) { return res.send(404); }
    resource.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
