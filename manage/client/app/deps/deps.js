'use strict';

angular.module('manageApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/deps', {
        templateUrl: 'app/deps/deps.html',
        controller: 'DepsCtrl'
      });
  });
