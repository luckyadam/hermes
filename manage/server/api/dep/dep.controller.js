'use strict';

var _ = require('lodash');
var Dep = require('./dep.model');
var Page = require('../page/page.model');
var UserController = require('../user/user.controller');

// Get list of deps
exports.index = function(req, res) {
  Dep.find().populate('dep').exec(function (err, deps) {
    if(err) { return handleError(res, err); }
    return res.json(200, {
      no: 0,
      errmsg: '成功',
      data: deps
    });
  });
};

// Get a single dep
exports.show = function(req, res) {
  Dep.findById(req.params.id).populate('dep').exec(function (err, dep) {
    if(err) { return handleError(res, err); }
    if(!dep) { return res.send(404); }
    return res.json(dep);
  });
};

// Creates a new dep in the DB.
exports.create = function(req, res) {
  var body = req.body;
  var existDeps = req.body.existDeps; // 已经存在的
  var createDeps = req.body.createDeps; // 需要新创建
  // var user = {UserController.me(req, res);}
  var depParam = {
    uri: body.uri,
    description: body.description,
    // creator: 'admin',
    createTime: new Date().getTime()
  };
  if (!_.isArray(existDeps) && !_.isArray(createDeps)) {
    return res.json(200, {
      no: 10000,
      errmsg: '输入参数错误'
    });

  }
  // 需要创建新的依赖关系
  if (_.isArray(createDeps)) {
    Page.collection.insert(createDeps, function (err, pages) {
      if(err) {
        if (err.code === 11000) {
          return res.json(200, {
            no: 10001,
            errmsg: '所依赖的页面已经存在'
          });
        }
        return handleError(res, err);
      }
      var pagesIds = _.pluck(pages, '_id');
      if (_.isArray(existDeps)) {
        depParam.dep = pagesIds.concat(existDeps);
      } else {
        depParam.dep = pagesIds;
      }
      createOneDepByParam(depParam, res);
    });
  } else {
    depParam.dep = existDeps;
    createOneDepByParam(depParam, res);
  }
};

// Updates an existing dep in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Dep.findById(req.params.id, function (err, dep) {
    if (err) { return handleError(res, err); }
    if(!dep) { return res.send(404); }
    var updated = _.merge(dep, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, dep);
    });
  });
};

// Deletes a dep from the DB.
exports.destroy = function(req, res) {
  Dep.findById(req.params.id, function (err, dep) {
    if(err) { return handleError(res, err); }
    if(!dep) { return res.send(404); }
    dep.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

function createOneDepByParam (param, res) {
  Dep.create(param, function (err, dep) {
    if(err) {
      if (err.code === 11000) {
        return res.json(200, {
          no: 10002,
          errmsg: '要添加的页面已经存在了'
        });
      }
      return handleError(res, err);
    }
    return res.json(201, {no: 0, errmsg: '成功', data: dep});
  });
}
