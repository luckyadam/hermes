'use strict';

angular.module('manageApp')
  .factory('Deps', function ($resource) {
    return $resource('/api/deps/:id', {
      id: '@_id'
    },
    {

    });
  });
