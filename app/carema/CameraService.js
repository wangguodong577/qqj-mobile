angular.module('cgwy')
    .factory('CameraService', ['$q', '$cordovaFileTransfer', 'apiConfig', function ($q, $cordovaFileTransfer, apiConfig) {

        return {
            getPicture: function (options) {
                var q = $q.defer();

                if(ionic.Platform.isWebView()) {
                    navigator.camera.getPicture(function (result) {
                        // Do any magic you need
                        q.resolve(result);
                    }, function (err) {
                        q.reject(err);
                    }, options);

                    return q.promise;
                } else {
                    q.reject("not support");
                }
            },

            upload: function(filePath) {
                return $cordovaFileTransfer.upload(apiConfig.host + "/api/v2/media", filePath, {
                    fileKey: "file",
                    chunkedMode: false
                }).then(function(result) {
                    console.log(result);

                    if(result.responseCode == 200) {
                        return angular.fromJson(result.response);
                    }
                });
            }
        }
    }]);