'use strict';

angular.module('manageApp')
  .factory('ServiceHelper', [
    'LxNotificationService',
    function(LxNotificationService) {
      return {
        alert: function (msg, callback) {
          LxNotificationService.alert(
            '提示',
            msg,
            '确定',
            function(answer) {
              if (typeof (callback) === 'function') {
                callback(answer);
              }
            });
        },
        confirm: function (msg, callback) {
          LxNotificationService.confirm(
          '提示',
          msg,
          { ok:'确定', cancel: '取消'},
          function(answer) {
            if (typeof (callback) === 'function') {
              callback(answer);
            }
          });
        }
      };
    }
  ]);
