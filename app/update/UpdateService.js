angular.module('cgwy')
    .factory('UpdateService', ['$log', '$q', 'apiConfig', function ($log, $q, apiConfig,$ionicPopup) {
        var fs = new CordovaPromiseFS({
            Promise: Promise
        });

        var loader = new CordovaAppLoader({
            fs: fs,
            serverRoot: 'http://www.canguanwuyou.cn/update/',
            localRoot: 'app',
            cacheBuster: true, // make sure we're not downloading cached files.
            checkTimeout: 10000, // timeout for the "check" function - when you loose internet connection
            mode: 'mirror',
            retry: [500,1000,5000],
            manifest: 'manifest.json' + "?" + Date.now()
        });
        var service = {
            // Check for new updates on js and css files
            check: function () {

                var defer = $q.defer();

                if(apiConfig.environment == "develop") {
                    defer.resolve(false);
                } else {
                    loader.check().then(function (updateAvailable) {
                        console.log("Update available:");
                        if (updateAvailable) {
                            defer.resolve(updateAvailable);
                        }
                        else {
                            defer.reject(updateAvailable);
                        }
                    });
                }

                return defer.promise;
            },
            // Download new js/css files
            download: function (onprogress) {
                var defer = $q.defer();

                loader.download(onprogress).then(function (manifest) {
                    console.log("Download active!");
                    defer.resolve(manifest);
                }, function (error) {
                    console.log("Download Error:");
                    defer.reject(error);
                });
                return defer.promise;
            },
            // Update the local files with a new version just downloaded
            update: function (reload) {
                console.log("update files--------------");
                return loader.update(reload);
            },
            // Check wether the HTML file is cached
            isFileCached: function (file) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.isCached(file);
                }
                return false;
            },
            // returns the cached HTML file as a url for HTTP interceptor
            getCachedUrl: function (url) {
                if (angular.isDefined(loader.cache)) {
                    return loader.cache.get(url);
                }
                return url;
            }
        };



        //1:成功 | 2:失败 | 3:不需要更新 | 4:未知情况
        service.updateApp = function (){
            var defer = $q.defer();
            service.check().then(function (result) {
                if (result === true) {
                    console.log('update manifest files');
                    var download = service.download();
                    download.then(
                        function (manifest) {
                            if (manifest != "error") {
                                service.update();
                                console.log('manifest files update success');
                                defer.resolve(1);
                            } else {
                                localStorage.removeItem('last_update_files');
                                console.log('manifest files update fail');
                                defer.resolve(2);
                            }
                        },
                        function (error) {
                            console.log('manifest error....: ');
                            console.log(JSON.stringify(error));
                            defer.resolve(4);
                        }
                    );
                } else {
                    console.log('not update manifest');
                    defer.resolve(3);
                }
            },
            function (error) {
                console.log('no update manifest -- error');
                console.log(JSON.stringify(error));
                defer.resolve(4);
            });
            return defer.promise;
        }
        return service;
    }])
