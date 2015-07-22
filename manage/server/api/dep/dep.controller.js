'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Dep = require('./dep.model');
var Page = require('../page/page.model');
var UserController = require('../user/user.controller');
var config = require('../../config/environment');

// Get list of deps
exports.index = function(req, res) {
  Dep.find()
    .populate('creator')
    .populate('pages')
    .sort({createTime: 'desc'})
    .exec(function (err, deps) {
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
  var user = req.user;
  var depParam = {
    uri: body.uri,
    description: body.description,
    creator: user._id,
    createTime: new Date()
  };
  if (!_.isArray(existDeps) && !_.isArray(createDeps)) {
    return res.json(200, {
      no: 10000,
      errmsg: '输入参数错误'
    });

  }
  // 需要创建新的依赖关系
  if (_.isArray(createDeps) && createDeps.length > 0) {
    createDeps.forEach(function (item) {
      item.creator = user._id;
      item.createTime = new Date();
    });
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
    var user = req.user;
    var depsParam = [];
    if (_.isArray(createDeps) && createDeps.length > 0) {
      createDeps.forEach(function (item) {
        item.creator = user._id;
        item.createTime = new Date();
      });
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
        dep.uri = req.body.uri;
        dep.description = req.body.description;
        dep.pages = depPages;
        dep.save(function (err) {
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
      dep.uri = req.body.uri;
      dep.description = req.body.description;
      dep.save(function (err) {
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

// 读取所有数据，生成配置文件
exports.generateAll = function (req, res) {
  Dep.find({}, '-creator -createTime -_id -__v')
    .sort({createTime: 'desc'})
    .populate({
      path: 'pages',
      // match: { $or: [{'enabled': true}, {'enabled': { $exists: true }}] },
      select: '-uri -description -creator -createTime -_id -__v -resources.enabled -resources._id'
    }).exec(function (err, deps) {
      if(err) { return handleError(res, err); }
      var date = new Date();
      var now = date.getTime();
      var folderName = config.root + config.staticPath + 'data';
      var newFile = path.join(folderName, 'config_file_' + now + '.conf');
      var defaultFile = path.join(folderName, 'config_file.conf');
      var existPromise = function () {
        return new Promise(function (resolve, reject) {
          fs.exists(folderName, function (exists) {
            if (exists) {
              resolve();
            } else {
              reject();
            }
          });
        });
      };

      var mkdirPromise = function () {
        return new Promise(function (resolve, reject) {
          fs.mkdir(folderName, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      };

      // 将MongooseCollection转为普通array
      deps = deps.map(function (item) {
        return item.toObject();
      });
      // 针对数据进行必要处理
      deps.forEach(function (dep) {
        dep.resources = [];
        if (_.isArray(dep.pages) && dep.pages.length > 0) {
          dep.pages.forEach(function (page) {
            if (page.resources && page.enabled) {
              page.resources.forEach(function (resource) {
                dep.resources.push(resource);
              });
            }
          });
        }
        delete dep.pages;
      });
      existPromise().then(function () {
      }, mkdirPromise).then(function () {
        fs.writeFile(newFile, JSON.stringify(deps), function (err) {
          if (err) {
            throw err;
          }
          fs.createReadStream(newFile).pipe(fs.createWriteStream(defaultFile));
          return res.json(200, {
            no: 0,
            errmsg: '生成文件成功',
            data: {
              fileName: 'config_file.conf',
              path: '/data/' + 'config_file.conf'
            }
          });
        });
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
