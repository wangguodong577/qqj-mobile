angular.module('cgwy')
    .controller('LoginCtrl', function ($scope, $rootScope, $state, ProfileService, WxReadyService, ProductService, FavoriteService, ActivityService, Analytics, AlertService) {
        $scope.user = {
            username: '',
            password: ''
        };

        $scope.isLoginState = false;

        if (window.localStorage['cachedUsername']) {
            $scope.user.username = window.localStorage['cachedUsername'];
        }

        $scope.login = function (user) {
            if (user.username === "") {
                AlertService.alertMsg("请输入手机号");
                return;
            }
            if (user.password === "") {
                AlertService.alertMsg("请输入密码");
                return;
            }
            
            $scope.isLoginState = true;

            ProfileService.login(user).then(function (data) {
                Analytics.trackEvent('profile', 'login', 'success', 1);
                FavoriteService.syncFavorite();
                ProfileService.setDisplayWelcome(true);

                if(ionic.Platform.isIOS()) {
                    ProfileService.bindBaiduPush('ios');
                } else if(ionic.Platform.isAndroid()) {
                    ProfileService.bindBaiduPush('android');
                }


                var currentPlatform = ionic.Platform.platform();
                //var deviceId = ProfileService.getDeviceId();
                //ProfileService.bindDevice(currentPlatform, deviceId);

                ActivityService.reloadActivities().then(function () {
                    $state.go("main.home");
                    $scope.isLoginState = false;
                });

                ProfileService.getProfile().then(function (profile) {
                    if (profile.id) {
                        WxReadyService.wxOnMenuShare(profile.id);
                        // console.log(profile.id);
                    }
                })
            }, function (data) {
                Analytics.trackEvent('profile', 'login', 'failure', 1);

                AlertService.alertMsg(data.errmsg).then(function () {
                    $scope.isLoginState = false;
                });
            })
        }

    })
