'use strict';

angular.module('manageApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/user', {
        templateUrl: 'app/user/user.html',
        controller: 'UserCtrl'
      });
  });
