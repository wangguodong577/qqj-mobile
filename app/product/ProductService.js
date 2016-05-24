angular.module('cgwy')
    .factory('ProductService', function ($http, $q, apiConfig, $rootScope) {

        var service = {};

        service.findSkus = function (criteria) {
            return  $http({
                url: apiConfig.host + "/api/v2/sku",
                method: 'GET',
                params: criteria
            }).then(function (payload) {
                return payload.data;
            });
        }

        service.findSkusId = function (id) {
            return  $http({
                url: apiConfig.host + "/api/v2/sku/" + id,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        }

        service.groupBrands = function (criteria) {
            return  $http({
                url: apiConfig.host + "/api/v2/sku/brand",
                method: 'GET',
                params: criteria
            }).then(function (payload) {
                return payload.data;
            });
        }

        service.miaoSha = function (cityId) {
            return  $http({
                url: apiConfig.host + "/api/v2/spike/effective/"+cityId,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        }

        service.seckillProduct = function(activeId){
            return  $http({
                url: apiConfig.host + "/api/v2/spike/item/"+activeId,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        }

        service.seckillProductDetail = function(itemId){
            return  $http({
                url: apiConfig.host + "/api/v2/spikeitem/query/"+itemId,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        }

        return service;
    })