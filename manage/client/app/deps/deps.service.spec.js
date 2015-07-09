'use strict';

describe('Service: deps', function () {

  // load the service's module
  beforeEach(module('manageApp'));

  // instantiate service
  var deps;
  beforeEach(inject(function (_deps_) {
    deps = _deps_;
  }));

  it('should do something', function () {
    expect(!!deps).toBe(true);
  });

});
