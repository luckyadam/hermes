'use strict';

angular.module('manageApp')
  .controller('DepsCtrl', function ($scope, Deps) {
    $scope.deps = null;
    // 获取依赖列表
    Deps.get().$promise.then(function (data) {
      if (data.no === 0) {
        $scope.deps = data.data;
      }
    });
  });
