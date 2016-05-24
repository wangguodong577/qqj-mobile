angular.module('cgwy')
    .factory('RestaurantService', function ($http, apiConfig) {

        var service = {};

        service.getRestaurantTypes = function () {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant/type",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        return service;
    })

