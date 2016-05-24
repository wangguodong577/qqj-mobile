angular.module('cgwy')
    .controller('SettingsCtrl', function ($scope, $ionicPopup, $timeout, $state, ProfileService, Analytics, CartService, ActivityService, WxReadyService,LocationService,CategoryService) {

    	$scope.logout = function () {
            var logoutConfirm = $ionicPopup.confirm({
                template: '<center>确定退出登录？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            logoutConfirm.then(function (res) {
                if (res) {
                    Analytics.trackEvent('profile', 'logout');

                    ProfileService.logout().then(function() {
                        CartService.resetCart();

                        ActivityService.reloadActivities();

                        $scope.profile = null;

                        WxReadyService.wxOnMenuShare();


                        //退出获取定位城市，将其存入缓存中；
                        LocationService.locationCity().then(function(data){
                            CategoryService.updateCategory();
                        });


                        window.sessionStorage.removeItem("restaurantName");

                        $state.go("main.profile");

                    });
                } else {
                    return;
                }
            });
        };

        if (ionic.Platform.isWebView() || ionic.Platform.isIOS()) {
            document.addEventListener("deviceready", function () {
                cordova.getAppVersion.getVersionNumber(function (version) {
                    // console.log(version);
                    $scope.currentVersion = version;
                });

            }, false);
        } else {
            $scope.currentVersion = null;
        }

        $scope.checkVersion = function () {
            var toast = document.getElementById('versionToast');
            toast.style.width = "40%";
            toast.style.left = "30%";
            toast.innerHTML = "当前已经是最新版本";
            toast.className = 'fadeIn animated';
            $timeout(function () {
                toast.className = 'hide';
            }, 2000)
        }

    });
