'use strict';

angular.module('manageApp')
  .controller('DepsCtrl', function ($rootScope, $scope, Deps) {
    $rootScope.pageName = 'deps';
    $scope.deps = null;
    // 获取依赖列表
    Deps.get().$promise.then(function (data) {
      if (data.no === 0) {
        $scope.deps = data.data;
      }
    });
  });
