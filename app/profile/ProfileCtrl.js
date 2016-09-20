angular.module('cgwy')
    .controller('ProfileCtrl', function ($scope, $rootScope, $state, $ionicPopup, ProfileService, CartService, ActivityService, Analytics,WxReadyService,FavoriteService,AlertService,LocationService,BackUrlUtil,CategoryService) {
        $scope.user = {
            username: '',
            password: ''
        };

        $scope.isLoginState = false;

        if (window.localStorage['cachedUsername'] != '') {
            console.log(window.localStorage['cachedUsername']+'.////111');
            $scope.user.username = window.localStorage['cachedU'];
            $scope.user.password = window.localStorage['cachedP'];
            ProfileService.login($scope.user).then(function (data) {
                console.log(data);
                $scope.profile = data;
                Analytics.trackEvent('profile', 'login', 'success', 1);
                FavoriteService.syncFavorite();
                ProfileService.setDisplayWelcome(true);

                ProfileService.bindBaiduPush();

                var currentPlatform = ionic.Platform.platform();
            })
        }
        console.log($scope.user);
        $scope.login = function (user) {
            if (user.username === "") {
                AlertService.alertMsg("请输入手机号");
                return;
            }
            if (user.password === "") {
                AlertService.alertMsg("请输入密码");
                return;
            }
            window.localStorage['cachedU'] = $scope.user.username;
            window.localStorage['cachedP'] = $scope.user.password;
            // console.log(user);
            $scope.isLoginState = true;

            ProfileService.login(user).then(function (data) {
                console.log(data);
                $scope.profile = data;
                Analytics.trackEvent('profile', 'login', 'success', 1);
                FavoriteService.syncFavorite();
                ProfileService.setDisplayWelcome(true);

                ProfileService.bindBaiduPush();

                var currentPlatform = ionic.Platform.platform();
                //var deviceId = ProfileService.getDeviceId();
                //ProfileService.bindDevice(currentPlatform, deviceId);

                if(!ionic.Platform.isWebView()) {
                    if($rootScope.wxcode) {
                        ProfileService.bindWxCode($rootScope.wxcode);
                    }

                }

                // //获取当前登录的城市，存入缓存中
                // ProfileService.getCustomerCityId().then(function(cityId){
                //     var cityName;
                //     if(cityId==1){
                //         cityName = "北京";
                //     }else if(cityId==2){
                //         cityName = "重庆";
                //     }else if(cityId==3) {
                //         cityName = "杭州";
                //     }else{
                //         cityName = "济南";
                //     }
                //     LocationService.chooseCity(cityId,cityName);
                //     CategoryService.updateCategory();
                // });

                // ActivityService.reloadActivities().then(function () {
                //     $state.go("main.home");
                //     console.log(111);
                //     $scope.isLoginState = false;
                // });

                // ProfileService.getProfile().then(function (profile) {
                //     if (profile.id) {
                //         WxReadyService.wxOnMenuShare(profile.id);
                //         // console.log(profile.id);
                //     }
                // })
            }, function (data) {
                Analytics.trackEvent('profile', 'login', 'failure', 1);

                AlertService.alertMsg(data.errmsg).then(function () {
                    $scope.isLoginState = false;
                });
            })
        }



//         ProfileService.getProfile().then(function (profile) {
//             $scope.profile = profile;
// 			console.log(profile);
//             if (profile) {
//             	$scope.currentLoginCityId = profile.cityId;
// //  				if(profile.block) {
// //                     $scope.currentLoginCityId = profile.city.id;
// //                 } else if(profile.zone) {
// //                     $scope.currentLoginCityId = profile.zone.warehouse.city.id;
// //                 }
//             } else {
//                 $scope.hasRestaurants = true;
//             }
//         });
//         // WxReadyService.isWeChat(function () {
//         //     wx.hideAllNonBaseMenuItem();
//         // });

//         //$scope.gotoView = function (cursor){
//         //	var stateName = "restaurant-list";
//         //	switch(cursor){
//         //		case 2:
//         //			stateName = "order-list";
//         //			break;
//         //		case 3:
//         //			stateName = "coupon";
//         //			break;
//         //        case 4:
//         //            stateName = "new-product-feedback";
//         //            break;
//         //	}
//         //	stateName = $scope.profile ? stateName : "login";
//         //	$state.go(stateName);
//         //}
//         //
//         //ProfileService.getRestaurants().then(function (data) {
//         //    $scope.restaurants = data;


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
                        $scope.user.username ='';
                        $scope.user.password ='';
                        $scope.profile = null;
                        window.localStorage['cachedUsername'] = '';
                        window.localStorage['cachedU'] = '';
                        window.localStorage['cachedP'] = '';
                    });

                } else {
                    return;
                }
            });
        };

//         $scope.complain = function () {
//             var complainConfirm = $ionicPopup.confirm({
//                 template: '<center>确定投诉客服？</center>',
//                 cancelText: '取消',
//                 cancelType: 'button-default',
//                 okText: '确定',
//                 okType: 'button-assertive'
//             });
//             complainConfirm.then(function (res) {
//                 if (res) {
//                     AlertService.alertMsg("投诉成功");
//                 } else {
//                     return;
//                 }
//             });
//         };


//         if(LocationService.getChosenCity().id === 2){
//             window.sessionStorage['CSH'] = "028-8774-8154"; // 成都客服
//             $scope.servicePhone = "028-8774-8154";
//         }else{
//             window.sessionStorage['CSH'] = "400-898-1100";
//             $scope.servicePhone = "400-898-1100";
//         }


//         $scope.dial = function (telephone,state) {
//             var msg =  state == 1 ? "确定拨打客服热线" : "确定要拨打的客服专员电话";
//             var serviceConfirm = $ionicPopup.confirm({
//                 template: '<center style="margin-left: -12px;margin-right: -12px;">' + msg + '<div style="color: red;margin-bottom: -10px;">' + telephone + '</div></center>',
//                 cancelText: '取消',
//                 cancelType: 'button-default',
//                 okText: '拨打',
//                 okType: 'button-assertive'
//             });
//             serviceConfirm.then(function (res) {
//                 if (res) {

//                     window.open('tel:' + telephone, '_system');
//                 } else {
//                     return;
//                 }
//             });

//             //浏览器、微信情况下,物理键返回处理
//             if(!ionic.Platform.isWebView()){
//                 window.onhashchange = function(){
//                     serviceConfirm.close(); //关闭
//                     window.onhashchange = null;
//                 }
//             }
//         }


//         if(ionic.Platform.isWebView()) {
//             $scope.feedbackAvailable = true;
//         }
    })
