'use strict';

angular.module('manageApp')
  .controller('AdminCtrl', function ($rootScope, $scope, $http, Auth, User) {
    $rootScope.pageName = 'admin';

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
