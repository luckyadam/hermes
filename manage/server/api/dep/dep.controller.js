'use strict';

var _ = require('lodash');
var Dep = require('./dep.model');
var Page = require('../page/page.model');
var UserController = require('../user/user.controller');

// Get list of deps
exports.index = function(req, res) {
  Dep.find().populate('pages').sort({createTime: 'desc'}).exec(function (err, deps) {
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
  Dep.findById(req.params.id).populate('pages').exec(function (err, dep) {
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
  var now = new Date().getTime();
  // var user = {UserController.me(req, res);}
  var depParam = {
    uri: body.uri,
    description: body.description,
    // creator: 'admin',
    createTime: now
  };
  if (!_.isArray(existDeps) && !_.isArray(createDeps)) {
    return res.json(200, {
      no: 10000,
      errmsg: '输入参数错误'
    });

  }
  // 需要创建新的依赖关系
  if (_.isArray(createDeps) && createDeps.length > 0) {
    createDeps.createTime = now;
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
      if (_.isArray(existDeps) && existDeps.length > 0) {
        existDeps = _.pluck(existDeps, '_id');
        depParam.pages = pagesIds.concat(existDeps);
      } else {
        depParam.pages = pagesIds;
      }
      createOneDepByParam(depParam, res);
    });
  } else {
    if (_.isArray(existDeps) && existDeps.length > 0) {
      existDeps = _.pluck(existDeps, '_id');
    }
    depParam.pages = existDeps;
    createOneDepByParam(depParam, res);
  }
};

// Updates an existing dep in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Dep.findById(req.params.id, function (err, dep) {
    if (err) { return handleError(res, err); }
    if(!dep) { return res.send(404); }
    var body = req.body;
    var depPages = body.pages;
    var createDeps = body.createDeps;
    var existDeps = body.existDeps;
    var depsParam = [];
    if (_.isArray(createDeps) && createDeps.length > 0) {
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
        if (_.isArray(existDeps) && existDeps.length > 0) {
          existDeps = _.pluck(existDeps, '_id');
          depsParam = depsParam.concat(existDeps);
        }
        depsParam = depsParam.concat(pagesIds);
        depPages = _.pluck(depPages, '_id');
        depPages = depPages.concat(depsParam);
        dep.pages = depPages;
        delete req.body.pages;
        delete req.body.createDeps;
        delete req.body.existDeps;
        var updated = _.assign(dep, req.body);
        updated.save(function (err) {
          if (err) { return handleError(res, err); }
          return res.json(200, {
            no: 0,
            errmsg: '成功',
            data: dep
          });
        });
      });
    } else {
      if (_.isArray(existDeps) && existDeps.length > 0) {
        existDeps = _.pluck(existDeps, '_id');
        depsParam = depsParam.concat(existDeps);
      }
      depPages = _.pluck(depPages, '_id');
      depPages = depPages.concat(depsParam);
      dep.pages = depPages;
      delete req.body.pages;
      delete req.body.createDeps;
      delete req.body.existDeps;
      var updated = _.assign(dep, req.body);
      updated.save(function (err) {
        if (err) { return handleError(res, err); }
        return res.json(200, {
          no: 0,
          errmsg: '成功',
          data: dep
        });
      });
    }
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
