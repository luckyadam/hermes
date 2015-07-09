'use strict';

describe('Controller: DepsCtrl', function () {

  // load the controller's module
  beforeEach(module('manageApp'));

  var DepsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DepsCtrl = $controller('DepsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
