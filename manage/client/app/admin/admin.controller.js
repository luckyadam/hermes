'use strict';

angular.module('manageApp')
  .controller('AdminCtrl', function ($rootScope, $scope, LxDialogService, LxNotificationService, Auth, User, ServiceHelper) {
    $rootScope.pageName = 'admin';

    // Use the User $resource to fetch all users
    User.query().$promise.then(function (data) {
      $scope.users = data;
    }, function (error) {
      if (error.status === 403) {
        $scope.errorInfo = '权限不够';
      }
    });

    $scope.roleList = ['admin', 'user'];

    $scope.modify = function ($index) {
      var user = $scope.users[$index];
      $scope.currentEdit = angular.copy(user);
      $scope.currentEdit.showLoading = false;
      $scope.modifyType = 'edit';
      $scope.currentIndex = $index;
      LxDialogService.open('modifyRoleDialog');
    };

    $scope.delete = function($index) {
      var user = $scope.users[$index];
      ServiceHelper.confirm('确认删除这个用户么', function (answer) {
        if (answer) {
          User.remove({ id: user._id }).$promise.then(function () {
            $scope.users.splice($index, 1);
            LxNotificationService.success('删除成功！');
          }, function () {
            LxNotificationService.error('删除失败，请重试！');
          });
        }
      });
    };

    $scope.saveEdit = function () {
      var editObj = angular.copy($scope.currentEdit);
      User.changeRole(editObj).$promise.then(function () {
        LxDialogService.close('modifyRoleDialog');
        LxNotificationService.success('修改成功！');
        $scope.users[$scope.currentIndex].role = editObj.role;
      });
    };
  });
