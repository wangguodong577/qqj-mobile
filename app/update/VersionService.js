angular.module('cgwy')
    .factory('VersionService', function ($http, $q, apiConfig,$ionicPopup,$ionicLoading) {
        var service = {};

        service.versionCode = 0;

        service.checkApp = function(versionCode) {
            if(versionCode) {
                return $http({
                    "url": apiConfig.host + "/api/v2/version/update",
                    method: 'GET',
                    params: {versionCode: versionCode}
                }).then(function (payload) {
                    if (payload.data && payload.data.versionCode  > versionCode) {
                        return payload.data;
                    }
                    return null;
                },
                function (error) {
                });
            } else {
                var deferred = $q.defer();
                deferred.resolve(null);
                return deferred.promise;
            }
        }
        return service;
    })
