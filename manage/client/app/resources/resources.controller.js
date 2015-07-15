'use strict';

angular.module('manageApp')
  .controller('ResourcesCtrl', function ($rootScope, $scope, $routeParams, LxNotificationService, LxDialogService, Resources, ServiceHelper) {
    var id = $routeParams.id;
    $rootScope.pageName = 'resources';

    function getResourcesList () {
      Resources.get({
        id: id
      }).$promise.then(function (data) {
        if (data.no === 0) {
          $scope.resources = data.data;
        }
      });
    }

    $scope.add = function () {
      $scope.currentEdit = {
        resources: [],
        newResources: [],
        showLoading: false
      };
      $scope.modifyType = 'add';
      LxDialogService.open('editResourcesDialog');
    };

    $scope.delete = function ($index) {
      ServiceHelper.confirm('确认要删除这一个页面么？', function (answer) {
        if (answer) {
          Resources.delete({
            id: $scope.resources[$index]._id
          }).$promise.then(function (data) {
            LxNotificationService.success('删除成功');
            $scope.resources.splice($index, 1);
          });
        }
      });
    };

    $scope.edit = function (page) {
      $scope.currentEdit = angular.copy(page);
      $scope.currentEdit.showLoading = false;
      $scope.currentEdit.newResources = [];
      $scope.modifyType = 'edit';
      LxDialogService.open('editResourcesDialog');
    };

    $scope.addOne = function () {
      $scope.currentEdit.newResources.push({
        uri: '',
        type: ''
      });
    };

    $scope.deleteOne = function ($index) {
      $scope.currentEdit.newResources.splice($index, 1);
    };

    $scope.deleteCurrentOne = function ($index) {
      $scope.currentEdit.resources.splice($index, 1);
    };

    $scope.saveEdit = function () {
      var editPage = angular.copy($scope.currentEdit);
      $scope.currentEdit.showLoading = true;
      delete editPage.modifyType;
      if ($.isArray(editPage.newResources)) {
        editPage.resources = editPage.resources.concat(editPage.newResources);
      }
      delete editPage.newResources;
      if ($scope.modifyType === 'edit') {
        Resources.update(editPage).$promise.then(function (data) {
          $scope.currentEdit.showLoading = false;
          LxDialogService.close('editResourcesDialog');
          getResourcesList();
        });
      } else if ($scope.modifyType === 'add') {
        Resources.save(editPage).$promise.then(function (data) {
          $scope.currentEdit.showLoading = false;
          LxDialogService.close('editResourcesDialog');
          getResourcesList();
        });
      }
    };

    getResourcesList();
  });
