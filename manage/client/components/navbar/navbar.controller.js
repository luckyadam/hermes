'use strict';

angular.module('manageApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin();
    $scope.currentUser = Auth.getCurrentUser();

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
        if($scope.currentUser.hasOwnProperty('$promise')) {
          $scope.currentUser.$promise.then(function () {
            $scope.isAdmin = Auth.isAdmin();
          });
        } else {
          $scope.isAdmin = Auth.isAdmin();
        }
      }
    });
  });
