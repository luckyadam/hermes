'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    // 设置session
    req.session.user = user;
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});
    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

router.post('/logout', function (req, res) {
  req.session.destroy(function(err){
    if (err) {
      console.log(err);
      return res.json(401, err);
    }
    res.json(200);
  });
});

module.exports = router;
