'use strict';

angular.module('manageApp')
  .factory('Deps', function ($resource) {
    return $resource('/api/deps/:id/:controller', {
      id: '@_id',
      controller: '@id'
    },
    {
      update: {
        method: 'PUT'
      },
      generate: {
        method: 'POST',
        params: {
          id: 'generate'
        }
      }

    });
  });
