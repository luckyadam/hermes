'use strict';

angular.module('manageApp')
  .factory('Resources', function ($resource) {
    return $resource('/api/pages/:id', {
      id: '@_id'
    },
    {

    });
  });
