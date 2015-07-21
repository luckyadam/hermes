'use strict';

angular.module('manageApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedInAsync = Auth.isLoggedInAsync;
    $scope.currentUser = Auth.getCurrentUser();

    Auth.isLoggedInAsync(function (isLogin) {
      if (isLogin) {
        $scope.isAdmin = Auth.isAdmin();
      } else {
        $scope.isAdmin = isLogin;
      }
    });

    $scope.logout = function() {
      Auth.logout(function () {
        $scope.currentUser = {};
        $scope.isAdmin = false;
      });
      $location.path('/login');
    };

    $scope.$on('loginBroadcast', function (event, msg) {
      if (msg) {
        $scope.currentUser = Auth.getCurrentUser();
        Auth.isLoggedInAsync(function (isLogin) {
          if (isLogin) {
            $scope.isAdmin = Auth.isAdmin();
          } else {
            $scope.isAdmin = isLogin;
          }
        });
      }
    });
  });
