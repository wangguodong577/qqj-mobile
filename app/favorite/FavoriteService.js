angular.module('cgwy')
    .factory('FavoriteService', function ($http, $q, apiConfig, $state, ProfileService, $rootScope) {

        var service = {};

        service.stashFavorites = JSON.parse(window.localStorage['stashFavorites'] || '[]');;



        service.syncFavorite = function() {
            service.stashFavorites.forEach(function(value) {
                service.markFavorite(value.sku);
            });

            window.localStorage['stashFavorites'] = '[]';
            service.stashFavorites = [];
        }

        service.getFavorites = function () {
            var deferred = $q.defer();

            ProfileService.getProfile().then(function(profile) {
               if(profile) {
                   return $http({
                       url: apiConfig.host + "/api/v2/favorite",
                       method: 'GET'
                   }).then(function (payload) {
                       $rootScope.favorites = payload.data;
                       return deferred.resolve(payload.data);
                   })
               } else {
                   $rootScope.favorites = service.stashFavorites;
                   deferred.resolve(service.stashFavorites);
               }
            });

            return deferred.promise;
        };

        service.markFavorite = function (sku) {
            return ProfileService.getProfile().then(function(profile) {
                if(profile) {
                    $http({
                        url: apiConfig.host + "/api/v2/favorite",
                        method: 'PUT',
                        params: {skuId: sku.id}
                    }).then(function (payload) {
                        service.getFavorites();
                    })
                } else {
                    var found = false;
                    service.stashFavorites.forEach(function(value) {
                        if(value.sku.id == sku.id) {
                            found = true;
                        }
                    })

                    if(!found) {
                        service.stashFavorites.push({sku: sku});
                        window.localStorage['stashFavorites'] = JSON.stringify(service.stashFavorites);
                    }
                }
            });

        };

        service.deleteFavorite = function (array) {
            return ProfileService.getProfile().then(function(profile) {
                if(profile) {
                    $http({
                        url: apiConfig.host + "/api/v2/favorite",
                        method: 'DELETE',
                        params: {skuId: array}
                    }).then(function (payload) {
                        service.getFavorites();
                    })
                } else {
                    var tmpArray = [];
                    service.stashFavorites.forEach(function(value) {

                        var found = false;
                        array.forEach(function(skuId) {
                            if(value.sku.id == skuId) {
                                found = true;
                            }
                        })

                        if(!found) {
                            tmpArray.push(value);
                        }
                    })
                    service.stashFavorites = tmpArray;
                    window.localStorage['stashFavorites'] = JSON.stringify(service.stashFavorites);
                }
            });


        };

        return service;
    })