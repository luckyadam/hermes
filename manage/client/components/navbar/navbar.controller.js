'use strict';

angular.module('manageApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.currentUser = Auth.getCurrentUser();

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };
  });
