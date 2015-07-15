'use strict';

angular.module('manageApp')
  .factory('Deps', function ($resource) {
    return $resource('/api/deps/:id/:controller', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT'
      },
      generateAll: {
        method: 'POST',
        params: {
          id: 'generate',
          controller: 'all'
        }
      }

    });
  });
