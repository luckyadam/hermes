'use strict';

angular.module('manageApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/resources', {
        templateUrl: 'app/resources/resources.html',
        controller: 'ResourcesCtrl',
        authenticate: true
      }).when('/resources/:id', {
        templateUrl: 'app/resources/resources.html',
        controller: 'ResourcesCtrl',
        authenticate: true
      });
  });
