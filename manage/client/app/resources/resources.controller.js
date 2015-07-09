'use strict';

angular.module('manageApp')
  .controller('ResourcesCtrl', function ($scope, $routeParams, Resources) {
    var id = $routeParams.id;
    Resources.get({
      id: id
    }).$promise.then(function (data) {
      if (data.no === 0) {
        $scope.resources = data.data;
      }
    });
  });
