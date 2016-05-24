// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

function initialize() {    
    var elem = angular.element(document.querySelector('#custom')); //get your angular element
    var injector = elem.injector(); //get the injector.
    var MapService = injector.get('MapService'); //get the service.
    MapService.geolocation(); //定位
}

angular.module('ngIOS9UIWebViewPatch', ['ng']).config(function($provide) {
    $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

        if (isIOS9UIWebView($window.navigator.userAgent)) {
            return applyIOS9Shim($delegate);
        }

        return $delegate;

        function isIOS9UIWebView(userAgent) {
            return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
        }

        function applyIOS9Shim(browser) {
            var pendingLocationUrl = null;
            var originalUrlFn= browser.url;

            browser.url = function() {
                if (arguments.length) {
                    pendingLocationUrl = arguments[0];
                    return originalUrlFn.apply(browser, arguments);
                }

                return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
            };

            window.addEventListener('popstate', clearPendingLocationUrl, false);
            window.addEventListener('hashchange', clearPendingLocationUrl, false);

            function clearPendingLocationUrl() {
                pendingLocationUrl = null;
            }

            return browser;
        }
    }]);
});

angular.module('cgwy', ['ionic', 'templatesCache', 'ionicLazyLoad', 'ngCordova', 'angular-google-analytics', 'ui.filters', 'ionic.rating', 'uuid', 'ngIOS9UIWebViewPatch'])
    .constant('apiConfig', {
		"host": "http://www.canguanwuyou.cn"
    })

    .run(function ($ionicPlatform, WxReadyService, WxTokenService, ProductService, CategoryService, CartService, ProfileService, $rootScope, $ionicHistory, FavoriteService, UpdateService, VersionService, ActivityService, AlertService, MapService, $cordovaToast, $interval,  $cordovaFileTransfer, $timeout, $cordovaBadge ) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            if (window.cordova) {
                $rootScope.devMode = false;
            } else {
                $rootScope.devMode = true;
            }

            // check for update
            UpdateService.check().then(function (result) {
                    if (result === true) {
                        console.log('update available');
                        var download = UpdateService.download();
                        download.then(
                            function (manifest) {
                                console.log('manifest.....:');
                                console.log(JSON.stringify(manifest));
                                UpdateService.update();
                            },
                            function (error) {
                                console.log('error....: ');
                                console.log(JSON.stringify(error));
                            }
                        );
                    } else {
                        console.log('not update available');
                    }
                },
                function (error) {
                    console.log('no update available');
                    console.log(JSON.stringify(error));
                });

			//加载百度地图API JS
			var script = document.createElement("script");
            script.src = "http://api.map.baidu.com/api?v=2.0&ak=kTPXBr7VXv7vaheBEHjiVsYK&callback=initialize";
            document.body.appendChild(script);
						
            var currentPlatform = ionic.Platform.platform();
            var currentPlatformVersion = ionic.Platform.version();

            var deviceId = ProfileService.getDeviceId();
            ProfileService.bindDevice(currentPlatform, deviceId);
            ProfileService.setDisplayWelcome(true);

            if (ionic.Platform.isAndroid() && ionic.Platform.isWebView()) {
                cordova.getAppVersion.getVersionCode(function (versionCode) {
                    console.log(versionCode);
                    $rootScope.versionCode = versionCode;
                    VersionService.checkApp(versionCode).then(function (v) {
                        console.log(v);
                        if (v) {

                            if(v.forceUpdate) {
                                //AlertService.alertMsg("有新版本更新，请前往应用市场更新");
                            }
                            var url = v.url;
                            var targetPath = cordova.file.externalApplicationStorageDirectory + '/cgwy/cgwy_' + versionCode + '.apk';
                            var trustHosts = true
                            var options = {};

                            // TODO: how to use download manager
                            //$cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                            //    .then(function(result) {
                            //        console.log('download file success:' + targetPath);
                            //        // Success!
                            //    }, function(err) {
                            //        console.log('download file fail: ');
                            //        console.log(err);
                            //        // Error
                            //    }, function (progress) {
                            //        $timeout(function () {
                            //            console.log('download file progress:' + (progress.loaded / progress.total) * 100);
                            //        })
                            //    });

                        }
                    })
                })
            }

            document.addEventListener("resume", function() {
                $cordovaBadge.clear().then(function() {
                    // You have permission, badge cleared.
                }, function(err) {
                    // You do not have permission.
                });
            }, false);

            if(window.device){
                var baidu_push_api_key = ionic.Platform.isIOS() ? 'QGi7yYY00oNPIe0Ug2gx1zZd' : 'zdfuy34n1x9XWmmGQiuhgP3q';
                console.log('startWork');

                if(typeof baidu_push !== 'undefined') {
                    baidu_push.startWork(baidu_push_api_key, function (json) {
                        // 将channelId和userId存储，待用户登录后回传服务器
                        if (ionic.Platform.isIOS()) {
                            userId = json.user_id;
                            channelId = json.channel_id;
                            console.log("ios channel id " + channelId)
                            ProfileService.bindBaiduPush("ios", channelId);
                        } else if(ionic.Platform.isAndroid()) {
                            userId = json.data.userId;
                            channelId = json.data.channelId;
                            console.log("android channel id " + channelId)
                            ProfileService.bindBaiduPush("android", channelId);
                        }
                    });
                }
            }

            $ionicPlatform.registerBackButtonAction(function (e) {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else if (!$rootScope.devMode && $ionicHistory.currentStateName().indexOf("main") == 0) {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast
                        .show("再按一次返回退出", 'short', 'center');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                } else if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                }
                e.preventDefault();
                return false;
            }, 101);


            $interval(function () {
                ActivityService.reloadActivities();
            }, 3600 * 1000)

        });

        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
                FavoriteService.getFavorites();
                if (profile.id) {
                    WxReadyService.wxOnMenuShare(profile.id);
                    // console.log(profile.id);
                }
            } else {
                WxReadyService.wxOnMenuShare();
            }
            ActivityService.reloadActivities();


        })

        WxReadyService.wxConfig(function(){
            WxTokenService.getAccess_token().then(function(data) {
                wx.config({
                    debug: false,
                    appId: data.data.appId,
                    timestamp: data.data.timestamp,
                    nonceStr: data.data.noncestr,
                    signature: data.data.signature,
                    jsApiList: [
                      'checkJsApi',
                      'onMenuShareTimeline',
                      'onMenuShareAppMessage',
                      'onMenuShareQQ',
                      'onMenuShareWeibo',
                      'hideMenuItems',
                      'showMenuItems',
                      'hideAllNonBaseMenuItem',
                      'showAllNonBaseMenuItem',
                      'translateVoice',
                      'startRecord',
                      'stopRecord',
                      'onRecordEnd',
                      'playVoice',
                      'pauseVoice',
                      'stopVoice',
                      'uploadVoice',
                      'downloadVoice', 
                      'previewImage',
                      'uploadImage',
                      'downloadImage',
                      'getNetworkType',
                      'openLocation',
                      'getLocation',
                      'hideOptionMenu',
                      'showOptionMenu',
                      'closeWindow',
                      'scanQRCode',
                      'chooseWXPay',
                      'openProductSpecificView',
                      'addCard',
                      'chooseCard',
                      'openCard'
                    ]
                });
            });
        });
        
        // WxReadyService.isWeChat(function () {
        //     wx.hideAllNonBaseMenuItem();
        // });

    })
    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider, AnalyticsProvider, $sceProvider, $compileProvider) {
		$ionicConfigProvider.views.maxCache(0);
		

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

        $sceProvider.enabled(false);

        // initial configuration
        AnalyticsProvider.setAccount('UA-63817465-1');
        // using multiple tracking objects (analytics.js only)
        // AnalyticsProvider.setAccount([
        //   { tracker: 'UA-12345-12', name: "tracker1" },
        //   { tracker: 'UA-12345-34', name: "tracker2" }
        // ]);

        // track all routes (or not)
        AnalyticsProvider.trackPages(true);

        // track all url query params (default is false)
        AnalyticsProvider.trackUrlParams(true);

        // Use display features plugin
        AnalyticsProvider.useDisplayFeatures(true);

        // Use analytics.js instead of ga.js
        AnalyticsProvider.useAnalytics(true);

        // Enabled eCommerce module for analytics.js(uses ec plugin instead of ecommerce plugin)
        AnalyticsProvider.useECommerce(true, true);

        // Enable enhanced link attribution
        AnalyticsProvider.useEnhancedLinkAttribution(true);

        // change page event name
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');

        // Delay script tage creation
        // must manually call Analytics.createScriptTag(cookieConfig) or Analytics.createAnalyticsScriptTag(cookieConfig)
        AnalyticsProvider.delayScriptTag(false);


        $ionicConfigProvider.tabs.position("bottom");

        $httpProvider.interceptors.push(['UpdateService', function (UpdateService) {
            return {
                'request': function (config) {
                    if (UpdateService.isFileCached(config.url)) {

                        var url = UpdateService.getCachedUrl(config.url);
                        config.url = url;
                    }
                    return config;
                },
                'response': function (response) {
                    return response;
                }
            };
        }]);

        $httpProvider.interceptors.push('httpResponseErrorInterceptor');

        $urlRouterProvider.otherwise('/welcome')

        $stateProvider.state('welcome', {
            url: '/welcome',
            views: {
                main: {
                    templateUrl: 'welcome/welcome.html',
                    controller: 'WelcomeCtrl'
                }
            }
        }).state('main', {
            url: '/main',
            views: {
                main: {
                    templateUrl: 'main/main.html',
                    controller: 'MainCtrl'
                }
            }
        }).state('main.home', {
            url: '/home',
            views: {
                main: {
                    templateUrl: 'home/home.html',
                    controller: 'HomeCtrl'
                }
            }
        }).state('main.category', {
            url: '/category',
            views: {
                category: {
                    templateUrl: 'category/category.html',
                    controller: 'CategoryCtrl'
                }
            }
        }).state('main.category.sub', {
            url: '/sub-category/{id:int}',
            views: {
                subCategoryMenuContent: {
                    templateUrl: 'category/sub-category.html',
                    controller: 'SubCategoryCtrl'
                }
            }
        }).state('search', {
            url: '/search?{categoryId:int}&{brandId:int}&{page:int}&sortProperty&sortDirection&backUrl&query',
            views: {
                main: {
                    templateUrl: 'product/product.html',
                    controller: 'ProductCtrl'
                }
            }
        }).state('product-detail', {
            url: '/product-detail?{id:int}&backUrl',
            views: {
                main: {
                    templateUrl: 'product/product-detail.html',
                    controller: 'ProductDetailCtrl'
                }
            }
        }).state('cart', {
            url: '/cart?backUrl',
            views: {
                main: {
                    templateUrl: 'cart/cart.html',
                    controller: 'CartCtrl'
                }
            },
            onExit: ['CartService', function(CartService){
                CartService.syncCart();
            }]
        }).state('cart-edit', {
            url: '/cart-edit?unselectAll',
            views: {
                main: {
                    templateUrl: 'cart/cart-edit.html',
                    controller: 'CartCtrl'
                }
            }
        }).state('order-list', {
            url: '/order-list',
            views: {
                main: {
                    templateUrl: 'order/order-list.html',
                    controller: 'OrderListCtrl'
                }
            }
        }).state('order-detail', {
            url: '/order-detail?{id:int}&backUrl',
            views: {
                main: {
                    templateUrl: 'order/order-detail.html',
                    controller: 'OrderDetailCtrl'
                }
            }
        }).state('main.favorite', {
            url: '/favorite',
            views: {
                favorite: {
                    templateUrl: 'favorite/favorite.html',
                    controller: 'FavoriteCtrl'
                }
            }
        }).state('favorite-rebuy', {
            url: '/favorite-rebuy?selectAll',
            views: {
                main: {
                    templateUrl: 'favorite/favorite-rebuy.html',
                    controller: 'FavoriteCtrl'
                }
            }
        }).state('favorite-edit', {
            url: '/favorite-edit',
            views: {
                main: {
                    templateUrl: 'favorite/favorite-edit.html',
                    controller: 'FavoriteCtrl'
                }
            }
        }).state('main.profile', {
            url: '/profile',
            views: {
                profile: {
                    templateUrl: 'profile/profile.html',
                    controller: 'ProfileCtrl'
                }
            }
        }).state('restaurant-list', {
            url: '/restaurant-list',
            views: {
                main: {
                    templateUrl: 'restaurant/restaurant-list.html',
                    controller: 'RestaurantListCtrl'
                }
            }
        }).state('restaurant-detail', {
            url: '/restaurant-detail?{id:int}',
            views: {
                main: {
                    templateUrl: 'restaurant/restaurant-detail.html',
                    controller: 'RestaurantDetailCtrl'
                }
            }
        }).state('login', {
            url: '/login',
            views: {
                main: {
                    templateUrl: 'profile/login.html',
                    controller: 'LoginCtrl'
                }
            }
        }).state('register', {
            url: '/register?sharerId',
            views: {
                main: {
                    templateUrl: 'profile/register.html',
                    controller: 'RegisterCtrl'
                }
            }
        }).state('forgot-password', {
            url: "/forgot-password",
            views: {
                main: {
                    templateUrl: "forget-password/forget-password.html",
                    controller: 'ForgetPasswordCtrl'

                }
            }
        }).state('activity', {
            url: "/activity?{index:int}",
            views: {
                main: {
                    templateUrl: "activity/activity.html",
                    controller: 'ActivityCtrl'
                }
            }
        }).state('new-product-feedback', {
            url: '/new-product-feedback',
            views: {
                main: {
                    templateUrl: 'feedback/feedback.html',
                    controller: 'FeedbackCtrl'
                }
            }
        }).state('confirm', {
            url: '/confirm?cId=?',
            views: {
                main: {
                    templateUrl: 'confirm/confirm.html',
                    controller: 'ConfirmCtrl'
                }
            }
        }).state('regist-success', {
            url: '/regist-success?sharerId',
            views: {
                main: {
                    templateUrl: 'profile/success.html',
                    controller: 'SuccessCtrl'
                }
            }
        }).state('provision', {
            url: '/provision',
            views: {
                main: {
                    templateUrl: 'provision/provision.html'
                }
            }
        }).state('order-evaluate', {
            url: '/order-evaluate/{id:int}',
            views: {
                main: {
                    templateUrl: 'order/order-evaluate.html',
                    controller: 'OrderEvaluateCtrl'
                }
            }
        }).state('coupon',{
            url: '/coupon',
            views: {
                main: {
                    templateUrl: 'profile/coupon.html',
                    controller: 'coupon'
                }
            }
        }).state('couponExp',{
            url: '/couponExp',
            views: {
                main: {
                    templateUrl: 'profile/couponExp.html'
                }
            }
        }).state('couponEdit',{
            url: '/couponEdit',
            views: {
                main: {
                    templateUrl: 'profile/couponEdit.html',
                    controller: 'couponEditCtrl'
                }
            }
        }).state('keyword-search',{
            url: '/keyword-search/{backUrl}',
            views: {
                main: {
                    templateUrl: 'search/search.html',
                    controller: 'SearchCtrl'
                }
            }
        }).state('add-restaurant',{
            url: '/add-restaurant',
            views: {
                main: {
                    templateUrl: 'restaurant/add-restaurant.html',
                    controller: 'AddRestaurantCtrl'
                }
            }
        }).state('invite-friends',{
            url: '/share',
            views: {
                main: {
                    templateUrl: 'share/share.html',
                    controller: 'ShareCtrl'
                }
            }
        }).state('share-page',{
            url: '/share-page?sharerId',
            views: {
                main: {
                    templateUrl: 'share/share-page.html',
                    controller: 'SharePageCtrl'
                }
            }
        }).state('map',{
            url: '/map',
            views: {
                main: {
                    templateUrl: 'map/map.html',
                    controller: 'MapCtrl'
                }
            }
        }).state('map.location', {
            url: '/map-location',
            views:{
            	maplocation:{
            		templateUrl: 'map/map-location.html',
            		controller: 'MapLocationCtrl'
            	}
            }
        }).state('map.near', {
            url: '/map-near',
            views:{
            	mapnear:{
            	 	templateUrl: 'map/map-near.html',
            		controller: 'MapNearCtrl'
            	}
            }
        })
    })
    .directive('back', function ($ionicHistory) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    $ionicHistory.goBack();
                });
            }
        };
    })
    .directive('setFocus', function () {
        return function(scope, element){
            element[0].focus();
        };
    });

window.BOOTSTRAP_OK = true;

angular.element(document).ready(function () {
    angular.bootstrap(document, ['cgwy']);
});


angular.module('cgwy').
    factory('httpResponseErrorInterceptor',function($q, $injector) {
    return {
        'responseError': function(response) {
            if(!response.config.retryCount) {
                response.config.retryCount = 0;
            }

            if (response.status === 0 && response.config.retryCount < 2) {
                response.config.retryCount ++;
                // should retry
                var $http = $injector.get('$http');
                return $http(response.config);
            }
            // give up
            return $q.reject(response);
        }
    };
});
angular.module('cgwy')
    .factory('ActivityService', function ($http, $q, apiConfig, $state, LocationService) {
        var service = {};

        service.banners = [];
        service.welcomeContent = null;
        service.shoppingTip = null;

        service.reloadActivities = function() {
			return service.reloadActivitiesByCityId(null);
        }
        
        //扩充根据城市ID查询活动数据 by linsen 2015.9.18
        //当用户不登录的时候以cityId为准,登录后以用户注册地为准
		service.reloadActivitiesByCityId = function(cityId){
			var url = apiConfig.host + "/api/v2/banner";
        	if(cityId != undefined)
        		url += "?cityId=" + cityId;
        		
        	return $http.get(url).then(function(payload) {
                if(payload.data.banner) {
                    service.banners = payload.data.banner;
                } else {
                    service.banners = [];
                }

                service.welcomeContent = payload.data.welcomeContent;
                service.shoppingTip = payload.data.shoppingTip;
                return payload.data;
            })
        }

        return service;
});

angular.module('cgwy')
    .controller('ActivityCtrl', function ($scope, $stateParams, ActivityService) {
        if(ActivityService.banners && ActivityService.banners[$stateParams.index]) {
            var banner = ActivityService.banners[$stateParams.index];
            $scope.contentUrl = banner.redirectUrl;
        }

    })

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
angular.module('cgwy')
    .controller('CartCtrl', function ($scope, $state, $stateParams, $rootScope, $location, $ionicPopup, ProductService, CategoryService, ProfileService, CartService, OrderService, AlertService, ActivityService, Analytics) {
        $scope.backUrl = '/main/category';
        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        } else if (window.localStorage['backUrl']) {
            $scope.backUrl = window.localStorage['backUrl'];
        }

        window.localStorage['backUrl'] = $scope.backUrl;

        $scope.back = function () {
            // 点击返回时，保存一下购物车


            $location.url($scope.backUrl);
        }

        $scope.data = {
        };

        $scope.dataModel = {
            selectAll : true
        }

        if ($stateParams.unselectAll) {
            $scope.dataModel.selectAll = false;
        }

        $scope.cart = null;

        if(ActivityService.shoppingTip) {
            $scope.shoppingTip = ActivityService.shoppingTip;
        }


        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (profile) {
                CartService.getCart().then(function (data) {
                    $scope.cart = data;

                    $scope.onSelectAllChange();

                    if ($scope.cart.orderItems.length != 0) {
                        $scope.isNullCart = false;
                    } else {
                        $scope.isNullCart = true;
                    }

                    $scope.calculateTotal();
                });
            }
        });

        $scope.checkChosen = function() {
            var isAllItemChosen = true;
            if ($scope.cart) {
                $scope.cart.orderItems.forEach(function (item) {
                    if (!item.chosen) {
                        isAllItemChosen = false;
                    }
                })
            }
            $scope.dataModel.selectAll = isAllItemChosen;
        }

        $scope.calculateTotal = function () {
            var total = 0;
            var count = 0;
            var quantity = 0;

            if ($scope.cart) {
                $scope.cart.orderItems.forEach(function (item) {
                    if (item.chosen) {
                        total += item.totalPrice;
                        count += 1;
                        quantity += item.quantity;
                    } else {
                    }
                })
            }
            $scope.total = total;
            $scope.orderItemCount = count;
            $scope.orderItemQuantity = quantity;

        }

        $scope.moreQuantity = function (orderItem) {
            orderItem.quantity = orderItem.quantity + 1;
            orderItem.totalPrice = orderItem.quantity * orderItem.price;
            $scope.calculateTotal($scope.cart);
        }


        $scope.lessQuantity = function (orderItem) {
            if (orderItem.quantity > 1) {
                orderItem.quantity = orderItem.quantity - 1;
                orderItem.totalPrice = orderItem.quantity * orderItem.price;
                $scope.calculateTotal($scope.cart);
            }
        }

        $scope.orderConfirm = function (order) {
            ProfileService.containsValidatedRestaurants().then(function (validated) {
                if (validated) {
                    if ($scope.orderItemCount > 0) {
                        var chosenOrderItemArray = [];
                        var chosenSkuArray = [];
                        order.orderItems.forEach(function (orderItem) {
                            if (orderItem.chosen) {
                                chosenOrderItemArray.push(orderItem);

                                chosenSkuArray.push({
                                    skuId: orderItem.sku.id,
                                    quantity: orderItem.quantity
                                })
                            }
                        });

                        CartService.checkStockOut(chosenSkuArray).then(function(stockOut) {
                            if(stockOut && stockOut.length > 0) {

                                var message = "以下商品缺货:";
                                stockOut.forEach(function(v) {
                                    message = message + " " + v.name;
                                });

                                AlertService.alertMsg(message);

                                stockOut.forEach(function(v) {
                                    order.orderItems.forEach(function (orderItem) {
                                        if (orderItem.sku.id == v.id) {
                                            if(v.stock) {
                                                orderItem.quantity = v.stock;
                                                orderItem.totalPrice = orderItem.quantity * orderItem.price;
                                            } else {
                                                orderItem.chosen = false;
                                            }
                                        }
                                    });
                                })
                                $scope.calculateTotal();
                                $scope.checkChosen();

                            } else {
                                CartService.setChosenItem(chosenOrderItemArray);
                                $state.go("confirm");
                            }
                        })




                    } else {
                        var orderConfirm = $ionicPopup.alert({
                            title: '提示信息',
                            template: '<center><font><strong size="4">请选择商品</strong></font></center>',
                            okText: '确定',
                            okType: 'button-assertive'
                        });
                    }
                } else {
                    $ionicPopup.alert({
                        title: '提示信息',
                        template: '<center><font><strong size="4">您没有审核通过的餐馆</strong></font></center>',
                        okText: '确定',
                        okType: 'button-assertive'
                    });
                }
            })

        };

        $scope.onSelectAllChange = function() {
            if ($scope.cart) {
                if ($scope.dataModel.selectAll) {
                    $scope.cart.orderItems.forEach(function (item) {
                        item.chosen = true;
                    })
                } else {
                    $scope.cart.orderItems.forEach(function (item) {
                        item.chosen = false;
                    })
                }

                $scope.calculateTotal();
            }

        };

        $scope.removeSelectedOrderItem = function () {
            if ($scope.cart) {

                var skuIds = [];

                if ($scope.cart.orderItems.length > 0) {
                    $scope.cart.orderItems.forEach(function (item) {
                        if (item.chosen) {
                            skuIds.push(item.sku.id);
                        }
                    });
                }

                if (skuIds.length == 0) {
                    AlertService.alertMsg("请选择商品");
                } else {

                    $ionicPopup.confirm({
                        title: '确认信息',
                        template: '<center><font size="4.1em">确定删除商品？</font></center>',
                        cancelText: '取消',
                        cancelType: 'button-default',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function (res) {
                        if (res) {
                            if ($scope.cart.orderItems.length > 0) {
                                $scope.cart.orderItems.forEach(function (item) {
                                    if (item.chosen) {
                                        skuIds.push(item.sku.id);
                                    }
                                });

                                CartService.removeSkuFromCart(skuIds).then(function (cart) {
                                    $state.go("cart");
                                });
                            }
                        } else {
                            return;
                        }
                    });
                }
            }
        }


        //商品详情页
        $scope.productDetail = function(skuId){
            $scope.burl =  $location.url();
            console.log($scope.burl);
            $state.go("product-detail",{id:skuId,backUrl: $scope.burl});
        }
    })
angular.module('cgwy')
    .factory('CartService', function ($http, $q, apiConfig, $state, $rootScope) {
        var service = {};

        service.getCart = function () {
            if(service.cart) {
                var deferred = $q.defer();
                deferred.resolve(service.cart);
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/cart",
                    method: 'GET'
                }).then(function (payload) {
                    if (payload.data.id) {
                        service.cart = payload.data;
                        return payload.data;
                    } else {
                        return null;
                    }
                })
            }
        };

        service.getOrderItemCount = function() {
            var orderItemsCount = 0;
            return service.getCart().then(function (cart) {
                if (cart) {
                    cart.orderItems.forEach(function(e) {
                        orderItemsCount += e.quantity;
                    })

                }

                return orderItemsCount;
            })
        }

        service.resetCart = function() {
            service.cart = null;
        }

        service.addSkuIntoCart = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/cart",
                method: 'POST',
                data: array
            }).then(function (payload) {
                service.cart = payload.data;
                return payload.data;
            }, function (error) {
                $state.go("login");
            })
        };

        service.syncCart = function () {
            if(service.cart && service.cart.orderItems) {
                var cart = service.cart;
                var skuArray = [];
                cart.orderItems.forEach(function (orderItem) {
                    skuArray.push({
                        skuId: orderItem.sku.id,
                        quantity: orderItem.quantity
                    })
                });

                return $http({
                    url: apiConfig.host + "/api/v2/cart",
                    method: 'PUT',
                    data: skuArray
                }).then(function (payload) {
                    service.cart = payload.data;
                    return payload.data;
                })
            }
        };

        service.checkStockOut = function(array) {
            return $http({
                    url: apiConfig.host + "/api/v2/order/stock",
                    method: 'PUT',
                    data: array
                }).then(function (payload) {
                    return payload.data;
                })
        }

        service.removeSkuFromCart = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/cart",
                method: 'DELETE',
                params: {skuId: array}
            }).then(function (payload) {
                service.cart = payload.data;
                return payload.data;
            }, function (error) {
                $state.go("login");
            })
        };

        service.chosenItem = [];
        service.setChosenItem = function(chosenItem) {
            service.chosenItem = chosenItem;
        };

        service.getChosenItem = function(){
            return service.chosenItem;
        };

        return service;
    })
angular.module('cgwy')
    .controller('CategoryCtrl', function ($scope, CategoryService, $state, AlertService, Analytics) {
        CategoryService.getLevel2Categories().then(function (data) {
            $scope.categories = data;
            $scope.selectedCategoryId = data[0].id;
            if($scope.categories.length > 0) {
                $scope.selectedCategoryId = $scope.categories[0].id;
                $state.go("main.category.sub", {id:$scope.categories[0].id});
            }
        }, function() {
            AlertService.alertMsg("网络异常");
        })

        $scope.clickCategory = function(category) {
            $scope.selectedCategoryId = category.id;
            $state.go("main.category.sub",{id:category.id});
        }

    })
angular.module('cgwy')
    .factory('CategoryService', function ($http, $q, apiConfig) {

        var service = {};

        function getCategory() {
            return $http({
                url: apiConfig.host + "/api/v2/category",
                method: 'GET'
            }).then(function (payload) {
                var level1Categories = []
                var level2Categories = []
                var level3Categories = []


                angular.forEach(payload.data, function (value) {
                    level1Categories.push(value);

                    angular.forEach(value.children, function (value) {
                        level2Categories.push(value);

                        angular.forEach(value.children, function (value) {
                            level3Categories.push(value);
                        })
                    })
                })

                var categories = level1Categories.concat(level2Categories).concat(level3Categories);

                return {
                    categories: categories,
                    level1Categories: level1Categories,
                    level2Categories: level2Categories,
                    level3Categories: level3Categories
                };
            });
        }

        var promise = getCategory();

        function getCategoryPromise() {
            return promise.then(function(data) {
                return promise;
            }, function() {
                promise = getCategory();
                return promise;
            })
        }


        service.getCategory = function (id) {
            return getCategoryPromise().then(function (data) {
                var categories = data.categories;
                for (var i = 0; i < categories.length; i++) {
                    var value = categories[i];
                    if (value.id == id) {
                        return value;
                    }
                }

                return null;
            })
        }

        service.getLevel = function (id) {
            return getCategoryPromise().then(function (data) {
                var level = 0;

                data.level1Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 1;
                    }
                })

                data.level2Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 2;
                    }
                })

                data.level3Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 3;
                    }
                })

                return level;
            })
        }


        service.getParentCategory = function (id) {
            return getCategoryPromise().then(function (data) {
                var categories = data.categories;
                for (var i = 0; i < categories.length; i++) {
                    var value = categories[i];

                    for(var j=0; j<value.children.length; j++) {
                        if (value.children[j].id == id) {
                            return value;
                        }
                    }
                }

                return null;
            })
        }


        service.getAllSubCategory = function (id) {
            return service.getCategory(id).then(function(category) {
                if(category) {
                    var array = [];
                    service.pushSubCategoryToArray(category, array);
                    return array;
                }
                else {
                    return [];
                }
            });
        }

        service.pushSubCategoryToArray = function(category, array) {
            array.push(category);
            if(category.children) {
                category.children.forEach(function(c) {
                    service.pushSubCategoryToArray(c, array);
                })
            }

        }

        service.getLevel2Categories = function () {
            return getCategoryPromise().then(function (data) {
                return data.level2Categories;
            });
        }

        return service;
    })

angular.module('cgwy')
    .controller('SubCategoryCtrl', function ($scope, CategoryService, $stateParams, ProfileService, Analytics) {
        CategoryService.getCategory($stateParams.id).then(function (data) {
            $scope.categories = [];
            $scope.categories.push({id: data.id, name: "全部"});

            data.children.forEach(function(v) {
                $scope.categories.push(v);
            })
        })

    })
angular.module('cgwy')
    .controller('ConfirmCtrl', function ($scope, $state,$stateParams, $rootScope, $filter, $ionicPopup, ProfileService, CartService, OrderService, Analytics) {
        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });

        ProfileService.getRestaurants().then(function (data) {
            $scope.myRestaurant = data[0];
        });

        

        $scope.chosenItem = [];
        $scope.previewOrder = function () {
            var array = [];

            $scope.chosenItem = CartService.getChosenItem();
            $scope.chosenItem.forEach(function(orderItem) {
                array.push({
                    skuId: orderItem.sku.id,
                    quantity: orderItem.quantity
                })

            })

            OrderService.previewOrder(array).then(function (orders) {
                $scope.total = 0;
                $scope.subTotal = 0;
                $scope.shipping = 0;

                $scope.promotions = [];

                var date = new Date();

                orders.forEach(function (o) {
                    $scope.total += o.total;
                    $scope.subTotal += o.subTotal;
                    $scope.shipping += o.shipping;

                    date = o.expectedArrivedDate;
                    $scope.expectedArrivedDate = $filter('date')(date, 'yyyy-MM-dd');

                    o.promotions.forEach(function (p) {
                        $scope.promotions.push(p);
                    })
                });
                var arr = [];
            
                $scope.chosenItem.forEach(function(orderItem) {
                    arr.push({
                        skuId: orderItem.sku.id,
                        quantity: orderItem.quantity
                    })
                })
                $scope.cId = $stateParams.cId;

                ProfileService.couponEdit(arr).then(function (data) {
                    $scope.coupons = data.data;
                    // console.log(data);
                    ProfileService.setCouponInfo($scope.coupons);
                    
                    if( $scope.cId ){
                        $scope.coupons.forEach(function(couponItem){
                            if( couponItem.id == $scope.cId ){
                                $scope.thisCoupon = couponItem;
                                $scope.total = $scope.total - $scope.thisCoupon.coupon.discount;
                                if($scope.total < 0) {
                                    $scope.total = 0;
                                }
                                couponItem.chosen = true;
                                // console.log($scope.total);
                                // console.log($scope.thisCoupon.coupon.discount);
                            }
                        })
                    }
                });
            });
        };

        $scope.previewOrder();

        $scope.submitOrder = function (cart) {
            var submitOrderConfirm = $ionicPopup.confirm({
                title: '确认信息',
                template: '<center><font size="4.1em">是否确认订单？</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            submitOrderConfirm.then(function (res) {
                if (res) {
                    var form = [];
                    $scope.chosenItem = CartService.getChosenItem();
                    $scope.chosenItem.forEach(function(orderItem) {
                        form.push({
                            skuId: orderItem.sku.id,
                            quantity: orderItem.quantity
                        })
                    })
                    if( $stateParams.cId ) {
                        var data = {
                            skuarray: form,
                            couponId: $stateParams.cId
                        }
                    } else {
                        var data = {
                            skuarray: form,
                            couponId: null
                        }
                    }
                    
                    OrderService.submitOrder(data).then(function (orders) {
                        CartService.resetCart();
                        CartService.getCart();

                        ProfileService.getProfile().then(function () {
                            Analytics.trackEvent('cart', 'click', 'submitOrder');
                        })

                        if (orders.length == 1) {
                            $state.go("order-detail", {id: orders[0].id});
                        } else {
                            $state.go("order-list");
                        }
                    }, function (data) {
                        var alertPopup = $ionicPopup.alert({
                            title: data.errmsg,
                            okText: '我知道了',
                            okType: 'button-default'
                        });
                    });
                } else {
                    return;
                }
            });
        }

        $scope.gotoCouponEdit = function() {
            if($scope.coupons && $scope.coupons.length > 0) {
                $state.go('couponEdit');
            }
        }

    })
angular.module('cgwy')
    .controller('FavoriteCtrl', function ($scope, $rootScope, $ionicPopup, $location, $state, $stateParams, ProductService, ProfileService, CartService, FavoriteService, AlertService, Analytics) {

        $scope.favorites = $rootScope.favorites ? $rootScope.favorites : [];

        $scope.getFavorites = function () {
            FavoriteService.getFavorites().then(function (favorites) {
                $scope.favorites = favorites;

                if ($stateParams.selectAll) {
                    $scope.selectAll = true;
                    $scope.clickSelectAll();
                }

                $scope.favorites.forEach(function (f) {
                    f.rebuyQuantity = 1;
                })

                if (favorites && favorites.length > 0) {
                    $scope.hasFavorites = true;
                } else {
                    $scope.hasFavorites = false;
                }
            })
        }

        $scope.getFavorites();

        // $scope.checkChosen();

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });

        $scope.moreQuantity = function (favorite) {
            if (!favorite.rebuyQuantity) {
                favorite.rebuyQuantity = 0;
            }

            favorite.rebuyQuantity = favorite.rebuyQuantity + 1;
        }

        $scope.lessQuantity = function (favorite) {
            if (favorite.rebuyQuantity) {
                if (favorite.rebuyQuantity > 1) {
                    favorite.rebuyQuantity = favorite.rebuyQuantity - 1;
                }
            }
        }

        $scope.addToCart = function () {
            var array = [];

            if ($scope.favorites) {
                $scope.favorites.forEach(function (f) {
                    if (f.chosen && f.rebuyQuantity) {
                        array.push({skuId: f.sku.id, quantity: f.rebuyQuantity});
                    }
                })
            }

            array.reverse();

            if (array.length == 0) {
                AlertService.alertMsg("请选择商品");
            } else {
                CartService.addSkuIntoCart(array).then(function () {
                    $state.go("cart", {backUrl: "/main/favorite"});

                });
            }
        }

        $scope.removeSelectedFavorite = function () {
            var array = [];

            if ($scope.favorites) {
                $scope.favorites.forEach(function (f) {
                    if (f.chosen) {
                        array.push(f.sku.id);
                    }
                })
            }

            if (array.length == 0) {
                AlertService.alertMsg("请选择商品");
            } else {
                $ionicPopup.confirm({
                    title: '确认信息',
                    template: '<center><font size="4.1em">确定删除收藏？</font></center>',
                    cancelText: '取消',
                    cancelType: 'button-default',
                    okText: '确定',
                    okType: 'button-assertive'
                }).then(function (res) {
                    if (res) {
                        if ($scope.favorites) {
                            $scope.favorites.forEach(function (f) {
                                if (f.chosen) {
                                    array.push(f.sku.id);
                                }
                            })
                        }

                        FavoriteService.deleteFavorite(array).then(function () {
                            $state.go('main.favorite');
                        });
                    }
                })
            }
        }

        $scope.checkChosen = function() {
            var isAllItemChosen = true;
            if ($scope.favorites) {
                $scope.favorites.forEach(function (item) {
                    if (!item.chosen) {
                        isAllItemChosen = false;
                    }
                })
            }
            $scope.selectAll = isAllItemChosen;
        }

        $scope.clickSelectAll = function() {
            var value = $scope.selectAll;
            if ($scope.favorites) {
                if (value) {
                    $scope.favorites.forEach(function (item) {
                        item.chosen = true;
                    })
                } else {
                    $scope.favorites.forEach(function (item) {
                        item.chosen = false;
                    })
                }
            }
        };
        $scope.backUrl =  "/main/favorite";
        //商品详情页
        $scope.productDetail = function(skuId){
            $state.go("product-detail",{id:skuId,backUrl: $scope.backUrl});
        }

    })
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
angular.module('cgwy')
    .controller('FeedbackCtrl', function ($scope, $state, $ionicActionSheet, $ionicBackdrop, ProfileService, CameraService, FeedbackService, AlertService) {
        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            }
        });

        $scope.form = {};

        $scope.uploadFile = function () {
            $upload.upload({
                url: '/api/v2/media',
                method: 'POST',
                file: files[i]
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadProgress = ('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data) {
                $scope.mediaUrl = data.url;
                $scope.form.mediaFileId = data.id;
            })
        }

        $scope.upload = function (filePath) {
            if (ionic.Platform.isWebView()) {
                if(filePath) {
                    $ionicBackdrop.retain();
                    $scope.showLoading = true;

                    CameraService.upload(filePath).then(function (file) {
                        console.log("upload feedback success");

                        $scope.showLoading = false;
                        $ionicBackdrop.release();

                        FeedbackService.feedback($scope.form.content, file.id).then(function () {
                            AlertService.alertMsg("反馈成功，我们会尽快处理").then(function() {
                                $state.go("main.profile")
                            });
                        });

                    }, function (err) {
                        console.log(err);

                        $scope.showLoading = false;
                        $ionicBackdrop.release();

                        AlertService.alertMsg("提交失败");
                        return;
                    })
                } else {
                    FeedbackService.feedback($scope.form.content).then(function () {
                        AlertService.alertMsg("反馈成功，我们会尽快处理").then(function() {
                            $state.go("main.profile")
                        });
                    })
                }
            }
        }

        $scope.addPicture = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [
                    {text: '从手机相册选择'},
                    {text: '拍照'}
                ],
                cancelText: '取消',
                cancel: function () {
                    return;
                },
                buttonClicked: function (index) {
                    if (index == 0) {
                        CameraService.getPicture({
                            quality: 75,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        }).then(function (imageURI) {
                            $scope.lastPhoto = imageURI;
                        })

                        return true;
                    } else if (index == 1) {
                        CameraService.getPicture({
                            quality: 75,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false
                        }).then(function (imageURI) {
                            $scope.lastPhoto = imageURI;
                        })

                        return true;
                    }
                }
            });
        };
    })

angular.module('cgwy')
    .factory('FeedbackService', function ($http, $q, apiConfig) {

        var service = {};

        service.feedback = function (content, fileId) {
            return $http({
                url: apiConfig.host + "/api/v2/feedback",
                method: 'POST',
                data: {feedbackDescription: content, mediaFileId: fileId}
            }).then(function(payload) {
                return payload.data;
            });
        };

        return service;
    })
angular.module('cgwy')
    .controller('ForgetPasswordCtrl', function ($scope, $state, $interval,ProfileService, AlertService) {
        $scope.codeChecked = false;

        $scope.form = {
            telephone: '',
            code: '',
            password: '',
            repeatPassword: ''
        }

        $scope.codeStatus = "获取验证码";
        $scope.buttonDisabled = false;
        $scope.codeTime = 60; 
        $scope.askCode = function (telephone) {
            if (telephone === "") {
                AlertService.alertMsg("请输入手机号");
                return;
            }
            if (telephone.length != 11) {
                AlertService.alertMsg("请输入规范的手机号");
                return;
            }
            
            ProfileService.askCode(telephone);

            var timer = setInterval(function(){
                $scope.codeTime--;
                $scope.codeStatus = $scope.codeTime + "秒后失效";
                $scope.buttonDisabled = true;

                if($scope.codeTime == 0){
                    $scope.codeStatus = '获取验证码';
                    $scope.buttonDisabled = false;
                    $scope.codeTime = 60; 
                    clearInterval(timer);
                } 

                $scope.$apply();
            }, 1000); 
        }

        $scope.checkCode = function (telephone, code) {
            if (telephone === "") {
                AlertService.alertMsg("请填写手机号");
                return;
            }
            if (telephone.length != 11) {
                AlertService.alertMsg("请输入规范的手机号");
                return;
            }
            if (code === "") {
                AlertService.alertMsg("请输入验证码");
                return;
            }

            ProfileService.checkCode(telephone, code).then(function (checked) {
                $scope.codeChecked = checked;
                if(!checked) {
                    AlertService.alertMsg("验证码错误");
                }

            }, function(data) {
                AlertService.alertMsg(data.errmsg);
            });
        }

        $scope.resetPassword = function (telephone, code, password, repeatPassword) {
            if (password === "") {
                AlertService.alertMsg("请填写新密码");
                return;
            }
            if (password.length < 6 || password.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号密码");
                return;
            }
            if (repeatPassword === "") {
                AlertService.alertMsg("请确定新密码");
                return;
            }
            if (password != repeatPassword) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }

            ProfileService.resetPassword(telephone, code, password).then(function () {
                AlertService.alertMsg("密码重置成功").then(function() {
                    $state.go('login');
                });
            });

            // TODO info of failure
        }
    })

angular.module('cgwy')
    .controller('HomeCtrl', function ($scope, $ionicPopup, $stateParams, $ionicSlideBoxDelegate, $state, $ionicPopover, UpdateService, OrderService, ProfileService, ActivityService, Analytics, AlertService, LocationService) {


		function showBanner(){
			if(ActivityService.banners && ActivityService.banners.length > 0) {
				console.log(ActivityService.banners);
				$scope.banners = ActivityService.banners;
				$ionicSlideBoxDelegate.update();
			}

			if(ProfileService.isDisplayWelcome()) {
				if(ActivityService.welcomeContent) {
					var alertPopup = $ionicPopup.alert({
						title: ActivityService.welcomeContent.welcomeTitle,
						template: ActivityService.welcomeContent.welcomeMessage,
						okText: '我知道了',
						okType: 'button-default'
					});

					ProfileService.setDisplayWelcome(false);
				}
			}
		}
        
        $scope.isNullTodayOrders = true;

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (profile) {
                ProfileService.getCustomerCityId().then(function(cityId) {
                    $scope.currentLoginCityId = cityId;
					$scope.currentCity = cityId === 2 ? "成都" : "北京"; //需要调整
					LocationService.chooseCity(cityId, $scope.currentCity);
                });

                OrderService.getTodayOrders().then(function(orders) {
                    $scope.todayOrders = orders;

                    if (orders.length > 0) {
                       $scope.isNullTodayOrders = false;
                    }
                })
            }
        })

        // 客服热线 Customer Service Hotline
        $scope.CSH = "400-898-1100"; // 北京客服
 
        $scope.dial = function() {
            window.open('tel:' + sessionStorage['CSH'], '_system');
        }

        $scope.showService = function() {
            if ($scope.profile) {
                // console.log($scope.profile);
                if( $scope.profile.adminUser != null ){
                    var serviceConfirm = $ionicPopup.confirm({
                       title: '确定要拨打您的客服专员电话',
                       template: '<center><font color="red" size="4.1em">'+$scope.profile.adminUser.telephone+'</font></center>',
                       cancelText: '取消',
                       cancelType: 'button-default',
                       okText: '拨打',
                       okType: 'button-assertive'
                    });
                    serviceConfirm.then(function(res) {
                       if(res) {
                           window.open('tel:' + $scope.profile.adminUser.telephone, '_system')
                       } else {
                         return;
                       }
                    });
                } else {
                    AlertService.alertMsg("请等待分配客服!");
                }
                
            }
            if (!$scope.profile) {
                var serviceConfirm = $ionicPopup.confirm({
                   title: '<div ng-click="dial()"><font color="red" size="4.5em">'+ sessionStorage['CSH'] +'</font></div>',
                   template: '<center><div style="font-size:1.1em">您注册后就可以直接下单！</div></center>',
                   cancelText: '取消',  
                   cancelType: 'button-default',
                   okText: '登录/注册',
                   okType: 'button-assertive'
                });
                serviceConfirm.then(function(res) {
                   if(res) {
                     $state.go("login");
                   } else {
                     return;
                   }
                });
            }
        };

        $scope.toCalculate = function() {
            AlertService.alertMsg("抱歉，功能还未生效，我们会尽快为您提供服务");
            return;
        };

        // $scope.showOutOfDateMsg = function() {
        //     AlertService.alertMsg("手慢啦！活动结束咯！新活动敬请期待！");
        //     return;
        // };

        $scope.gotoFeedback = function() {
            if(ionic.Platform.isWebView()) {
                $state.go("new-product-feedback");
            } else {
                $scope.toCalculate();
            }
        };

        $scope.contact = function (truckerTel) {
            var contactConfirm = $ionicPopup.confirm({
                title: '确定要拨打您此单的司机电话？',
                template: '<center><font color="red" size="4.1em">' + truckerTel + '</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '拨打',
                okType: 'button-assertive'
            });
            contactConfirm.then(function (res) {
                if (res) {
                    window.open('tel:' + truckerTel, '_system');
                } else {
                    return;
                }
            });
        };

        $scope.isShowContactBtn = function (orderSubmitDate) {
            var result = false;
            var date = new Date();//当前时间
            var submitOrderDate = new Date(orderSubmitDate);
            submitOrderDate.setDate(submitOrderDate.getDate() + 1);//订单提交时间24小时之后

            if (typeof orderSubmitDate == 'undefined' || orderSubmitDate == null) {
                result = false;
            } else {
                if (date.getHours() >= 13 && submitOrderDate.getDate() == date.getDate()) {
                    result = true;
                }
            }

            return result;
        }

        $ionicPopover.fromTemplateUrl('templates/citySelectPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.citySelectPopover = popover;
        });

        LocationService.getCities().then(function (cities) {
            $scope.openCities = cities;
        });

        if (LocationService.getChosenCity()) {
            $scope.currentCity = LocationService.getChosenCity().name;
            //如果登陆了则显示登陆城市
            
            loadActivityByCityId();
        } else {
            LocationService.getCurrentCity().then(function (currentCity) {
                if (currentCity.data.status === 0) {
                    var location_city_code = currentCity.data.content.address_detail.city_code;
                    var currentCity, currentCityId;

                    if (location_city_code === 131) {
                        currentCity = "北京";
                        currentCityId = 1;
                    } else if (location_city_code === 75 || location_city_code === 32) {
                        currentCity = "成都";
                        currentCityId = 2;

                        $scope.CSH = "028-8774-8154"; // 成都客服
                    } else {
                        currentCity = "北京";
                        currentCityId = 1;
                    }
                    window.sessionStorage['CSH'] = $scope.CSH;
                    $scope.currentCity = currentCity;
                    LocationService.chooseCity(currentCityId, currentCity);
                    loadActivityByCityId(); //根据定位城市ID查询活动
                }
            }, function(err) {
                var currentCity = "北京";
                var currentCityId = 1;

                window.sessionStorage['CSH'] = $scope.CSH;

                $scope.currentCity = currentCity;
                LocationService.chooseCity(currentCityId, currentCity);
            });
        }


		function loadActivityByCityId(){
			if(ActivityService.banners && ActivityService.banners.length > 0 && ActivityService.welcomeContent) {
				showBanner();
			}else{
				var cityId = LocationService.getChosenCity().id;
				ActivityService.reloadActivitiesByCityId(cityId).then(function() {
					showBanner();
				})
            }
		}

        $scope.currentCityClick = function () {
            $scope.citySelectPopover.hide();
        };

        $scope.citySelected = function (openCityId) {
            $scope.citySelectPopover.hide();

            for (var i=0; i < $scope.openCities.length; i++) {
                if ($scope.openCities[i].id === openCityId) {
                    $scope.currentCity = $scope.openCities[i].name;

                    LocationService.chooseCity($scope.openCities[i].id, $scope.openCities[i].name);
                }
            }
        };
    });

angular.module('cgwy')
    .service('LocationService', function ($http, $q, apiConfig, ProfileService) {
        this.getCities = function () {
            return $http({
                url: apiConfig.host + "/api/v2/city",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        };

        this.getCurrentCity = function () {
            return $http.jsonp("http://api.map.baidu.com/location/ip?ak=1507703fda1fb9594c7e7199da8c41d8&coor=bd09ll&callback=JSON_CALLBACK")
            .success(function (data) {   
                return data;
            });
        };

        this.chooseCity = function(cityId, cityName) {
            window.sessionStorage.setItem("currentCity",JSON.stringify({"id": cityId, "name": cityName}));
        }

        this.getChosenCity = function() {
            return window.sessionStorage.getItem("currentCity") ? JSON.parse(window.sessionStorage.getItem("currentCity")) : null;
        }

        this.getCustomerCityId = function() {
            return ProfileService.getProfile().then(function (profile) {
                var cityId = 1;

                if (profile) {
                    if(profile.block) {
                        cityId = profile.block.city.id;
                    } else if(profile.zone) {
                        cityId = profile.zone.warehouse.city.id;
                    }
                }

                return cityId;
            })
        }
    });

angular.module('cgwy')
    .controller('MainCtrl', function ($scope, UpdateService, OrderService, ProfileService, Analytics) {
    });

angular.module('cgwy')
    .controller('MapCtrl', function ($scope, $stateParams, $state, MapService) {
 		var map = new BMap.Map("allmap");
 		if(MapService.isUsePointByCache()){
			map.centerAndZoom(MapService.getPoint(), 17);  //创建中心点,放大等级
 			map.setCenter(MapService.getPoint());
			initSearch();
 		}else{
	 		map.centerAndZoom(MapService.getViewModel().cityName, 15); //根据城市名称定位 
	 		initSearch();		
	 		map.addEventListener("tilesloaded",function(){
	 			MapService.geolocation(geoCallback);
				//定位回调
				function geoCallback(){
					if(MapService.getPointState() == 1){
						map.centerAndZoom(MapService.getPoint(), 17); 
						map.setCenter(MapService.getPoint());
						initSearch();
					}
				}
	 		});
 		}
 		
 		map.addEventListener("dragend", function(){
			initSearch();
 		});
 				
 		var searchNearBounds = null;
 		var searchLocalBounds = null;
 		//----------- tab页左右侧查询 ---------------	
 		function initSearch(){
 			if(searchNearBounds == null)
	 			searchNearBounds = new BMap.LocalSearch(map, { onSearchComplete : searchNearComplete });
			if(searchLocalBounds == null)
				searchLocalBounds = new BMap.LocalSearch(map, { onSearchComplete : searchLocationComplete });
			searchLocal();
 			searchNear();
 		}
		
 		
		//根据searchInBounds 查询条件数量来决定返回的是Array[LocalResult]还是LocalResult
		function arrayToArray(result){
			var arrayObj = new Array(); //最终结果集
			for(var r = 0; r < result.length; r++){
				var pois = result[r];
				for(var p = 0; p < pois.getNumPois(); p++){
					var poiObj = pois.getPoi(p);
					if(typeof(poiObj) != "undefined")
						arrayObj.push(poiObj); //测试中发现曾经添加进去了 undefined,情况无法复现所以加次判断过滤
				}
			}
			return arrayObj;
		}
		
		
		function searchNearComplete(result){
			$scope.$apply(function(){
				$scope.pois = arrayToArray(result);
			})
		}

		function searchLocationComplete(result){
			$scope.$apply(function(){
				$scope.locals = arrayToArray(result);
			})
		}

		//根据地图现实区域查询餐馆(区域信息)
		function searchNear(){
			searchNearBounds.searchInBounds(["餐馆","酒店","小吃","饭店"], map.getBounds());
		}
	
		//根据地图中心点展示poi数据(位置信息)
		function searchLocal(){
			var geoc = new BMap.Geocoder(); 
			geoc.getLocation(map.getCenter(), function(rs){
				$scope.$apply(function(){
					if(rs.surroundingPois.length != 0)
						$scope.locals = rs.surroundingPois;
					else
						searchLocalBounds.searchInBounds(["街","路"], map.getBounds());
				})
			});
		}
		
			
 		//点击列表时候回调(1:搜索关键字<AutocompleteResultPoi>  | 2:附近,location <LocalResultPoi>)
		$scope.clickItem = function(poi,type) {
			var result = "";
			var model = MapService.getViewModel();
			if(type === 1){
				//暂时没有该情况
				result = poi.city + poi.district + poi.business;
			}else if(type === 2){
				result = poi.title + "-" + poi.address;
				model.restaurantAddress = result;
				model.lat = map.getCenter().lat;
				model.lng = map.getCenter().lng;
			}
			$state.go('register',{sharerId:model.sharerId});
        }
})

angular.module('cgwy')
    .controller('MapLocationCtrl', function ($scope, $stateParams, $state, MapService) {
})

angular.module('cgwy')
    .controller('MapNearCtrl', function ($scope, $stateParams, $state, MapService) {
})

angular.module('cgwy')
    .factory('MapService', function ($http, $q, apiConfig, $state, WxReadyService,$ionicPopup) {
	    var service = {};
	    service.pointTime = 0;
// 	    service.defPoint = new BMap.Point(116.40387397,39.91488908);
    
		//保存页面的Model
		service.setViewModel = function (viewModel) {
            service.viewModel = viewModel;
        }

		//获取页面Model
        service.getViewModel = function () {
            return service.viewModel;
        }
        
        //删除页面Model
        service.delViewModel = function (){
        	service.viewModel = null;
        } 
        
        
        //定位是否成功
        service.getPointState = function (){
        	return service.pointState;
        }
        
 //        //定位时间
//         service.getPointTime = function () {
//         	return service.pointTime;
//         }
        
        //定位的坐标
        service.getPoint = function () {
        	if(service.point == undefined){
//         		/return service.defPoint;
        		return new BMap.Point(116.40387397,39.91488908);
        	}
        	return service.point;
        }
        
        service.isUsePointByCache = function (){
        	var currtime = (new Date()).valueOf();
        	if(service.pointState == 1 && service.pointTime +  1800000 >  currtime){
        		return true;
        	}
        	return false;
        }
        
        /*
         * 获取定位坐标加入以下逻辑 :
         * 1:定位数据
         * 2:距离上一次定位时间超过30分钟
         */
        service.geolocation = function (callback){
        	if(service.isUsePointByCache()){
        		callback();
			}else{
				starGeoLocation(callback);
			}
        }
        
        var locationServiceObj = null;
        function starGeoLocation(callback){
        	if(!WxReadyService.isWeChat(function() {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
							retPoint(res.longitude, res.latitude,callback,true);
                        },
                        fail:function (err){
                        	retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
                        }
                    });
                })) {
                                
				try{
					locationServiceObj = cordova.plugins.LocationService; //安卓定位插件
				}catch(e){
					locationServiceObj = null;
				}
                //-----------------安卓地图定位------------------
				if(ionic.Platform.isAndroid() && window.cordova && locationServiceObj != null){
					var bdOnSuccess = function(entry){
						switch(entry.state_code){
							case 4:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;
							case 5:
								retPointError(callback,"暂时无法获取位置信息，请开启定位服务");
								break;
							default:
								retPoint(entry.lng, entry.lat,callback,false);
						}	
					}
					
					var bdOnError = function(error){ retPointError(callback);}
					//安卓地图定位
					cordova.plugins.LocationService.getLocationService("",bdOnSuccess,bdOnError);
				}else if (ionic.Platform.isIOS() && window.cordova && navigator.geolocation != undefined){
					//-----------------iOS地图定位------------------
					var onSuccess = function(position) {
						retPoint(position.coords.longitude, position.coords.latitude, callback,true);
					};

					var onError = function(error) {
						switch(error.code){
							case error.TIMEOUT:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;
							case error.PERMISSION_DENIED:
								retPointError(callback,"无法获取你的位置信息。请到手机系统的[设置]->[隐私]->[定位服务]中打开定位服务,并允许餐馆无忧使用定位服务。");
								break;
							case error.POSITION_UNAVAILABLE:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;	
							default:
								retPointError(callback, "暂时无法获取位置信息，请检查网络重试");
											
						}
					}
					navigator.geolocation.getCurrentPosition(onSuccess, onError);
				}else{
					//-----------------普通地图定位------------------
					var geolocation = new BMap.Geolocation();
					geolocation.getCurrentPosition(function(r){
						if(this.getStatus() == BMAP_STATUS_SUCCESS)
							retPoint(r.point.lng, r.point.lat, callback ,false);
						else
							retPointError(callback);
							
					},{enableHighAccuracy: true})
				}
            }
        }
        
        
        /*
         *   longitude:经度
         *   latitude:纬度
         *	 callback:回调函数
         *   baiduconv: 是否需要百度坐标转换
         */
        function retPoint(longitude,latitude,callback,baiduconv){
        	service.pointState = 1; //成功
        	service.pointTime = (new Date()).valueOf();
        	if(baiduconv){
        		$http.jsonp('http://api.map.baidu.com/geoconv/v1/?callback=JSON_CALLBACK&ak=aGAtGnhqerwXBYrlntNMFt2i&coords=' + longitude + ',' + latitude).then(function (payload) {
					r = payload.data;
					var latitude = r.result[0].y; // 纬度，浮点数，范围为90 ~ -90
					var longitude = r.result[0].x; // 经度，浮点数，范围为180 ~ -180。
					service.point = new BMap.Point(longitude, latitude); //记录坐标
					service.pointState = 1; //成功
					
					if(callback != undefined) {
						callback();
					}

				})
        	}else{
        		//百度js定位如果定位失败返回坐标 locationServiceObj == null 在没有cordova plugin是才提示
				if(latitude == 39.91488908 && longitude == 116.40387397 && locationServiceObj == null){
					showAlert("暂时无法获取位置信息，请检查定位服务是否开启");
					service.pointState = 2; //失败
				}
        		service.point = new BMap.Point(longitude, latitude); //记录坐标
	        	if(callback != undefined)
    	    		callback();
        	}
        }
                    
		//定位失败回调
        function retPointError(callback,msg){
        	showAlert(msg);
        	service.pointState = 2; //失败
	        if(callback != undefined)
    	    	callback();
        }
        
        //提示信息       
		var showAlert = function(msg) {
			var alertPopup = $ionicPopup.alert({
				title: '位置服务',
				template: '<div style="text-align:center;">' + msg + '</div>'
			});	
		};
		  
    return service;
});

angular.module('cgwy')
    .controller('OrderDetailCtrl', function ($scope, $ionicPopup, ProfileService, OrderService, CartService, $stateParams, $state, $location) {

        $scope.backUrl = $stateParams.backUrl ? $stateParams.backUrl : 'order-list';
        $scope.back = function(){
            $state.go($scope.backUrl);
        }

        $scope.currentUrl = $location.url();
        OrderService.getOrder($stateParams.id).then(function (order) {
            $scope.order = order;
        });

        $scope.orderCancel = function() {
            var orderCancelConfirm = $ionicPopup.confirm({
               title: '确认信息',
               template: '<center><font size="4.1em">确定撤销该订单？</font></center>',
               cancelText: '取消',
               cancelType: 'button-default',
               okText: '确定',
               okType: 'button-assertive'
            });
            orderCancelConfirm.then(function(res) {
               if(res) {
                    //TODO ... android toast
                   OrderService.cancelOrder($stateParams.id).then(function(data) {
                       $scope.order = data;
                   });
               } else {
                    return;
               }
             });
        };

        $scope.orderAgain = function(order) {
            if(order.orderItems) {
                var array = [];
                order.orderItems.forEach(function(orderItem) {
                    array.push({skuId: orderItem.sku.id, quantity: orderItem.quantity});
                });

                CartService.addSkuIntoCart(array).then(function() {
                    $state.go('cart');
                });
            }
        };

        $scope.contact = function (truckerTel) {
            var contactConfirm = $ionicPopup.confirm({
                title: '确定要拨打您此单的司机电话？',
                template: '<center><font color="red" size="4.1em">' + truckerTel + '</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '拨打',
                okType: 'button-assertive'
            });
            contactConfirm.then(function (res) {
                if (res) {
                    window.open('tel:' + truckerTel, '_system');
                } else {
                    return;
                }
            });
        };

        $scope.isShowContactBtn = function (orderSubmitDate) {  
            var result = false;
            var date = new Date();//当前时间
            var submitOrderDate = new Date(orderSubmitDate);
            submitOrderDate.setDate(submitOrderDate.getDate()+1);//订单提交时间24小时之后

            if (typeof orderSubmitDate == 'undefined' || orderSubmitDate == null) {
                result = false;
            } else {
                if (date.getHours() >= 13 && submitOrderDate.getDate() == date.getDate()) {
                    result = true;
                }
            }

            return result;
        };
    })

angular.module('cgwy')
    .controller('OrderEvaluateCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaToast, $ionicPopup, AlertService, OrderService) {

        $scope.data = {
            productCount: 0,
            deliveryCount: 0,
            trackerCount: 0
        }

        $scope.OrderEvaluateForm = {
            productQualityScore: 0,
            deliverySpeedScore: 0,
            trackerServiceScore: 0,
            msg: ''
        }
  
        $scope.$watch('data.productCount', function() {
            $scope.OrderEvaluateForm.productQualityScore = $scope.data.productCount * 2;
        });  

        $scope.$watch('data.deliveryCount', function() {
            $scope.OrderEvaluateForm.deliverySpeedScore = $scope.data.deliveryCount * 2;
        }); 

        $scope.$watch('data.trackerCount', function() {
            $scope.OrderEvaluateForm.trackerServiceScore = $scope.data.trackerCount * 2;
        }); 

        $scope.submitOrderEvaluation = function() {
          
            if($scope.OrderEvaluateForm.productQualityScore == 0 
                || $scope.OrderEvaluateForm.deliverySpeedScore == 0
                  || $scope.OrderEvaluateForm.trackerServiceScore == 0) {
                AlertService.alertMsg("请完成所有打分才能提交");
                return;
            }

            OrderService.submitOrderEvaluation($stateParams.id,$scope.OrderEvaluateForm).then(function (){
                if (!$rootScope.devMode) {
                    $cordovaToast.show("评价成功", 'short', 'center')
                        .then(function (success) {
                            $state.go('order-list');
                        }, function (error) {

                        });
                } else {
                    var alertTemplate = $ionicPopup.alert({
                        title: '提示信息',
                        template: '<center><div style="font-size:1.1em">评价成功</div></center>',
                        okText: '确定',
                        okType: 'button-assertive'
                    });
                    alertTemplate.then(function () {
                        $state.go('order-list');
                    })
                }
            })
        }
    });

(function() {
  angular.module('ionic.rating', []).constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
  }).controller('RatingController', function($scope, $attrs, ratingConfig) {
    var ngModelCtrl;
    ngModelCtrl = {
      $setViewValue: angular.noop
    };
    this.init = function(ngModelCtrl_) {
      var max, ratingStates;
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;
      this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
      this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
      max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
      ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) : new Array(max);
      return $scope.range = this.buildTemplateObjects(ratingStates);
    };
    this.buildTemplateObjects = function(states) {
      var i, j, len, ref;
      ref = states.length;
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        states[i] = angular.extend({
          index: 1
        }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, states[i]);
      }
      return states;
    };
    $scope.rate = function(value) {
      if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
        ngModelCtrl.$setViewValue(value);
        return ngModelCtrl.$render();
      }
    };
    $scope.reset = function() {
      $scope.value = ngModelCtrl.$viewValue;
      return $scope.onLeave();
    };
    $scope.enter = function(value) {
      if (!$scope.readonly) {
        $scope.value = value;
      }
      return $scope.onHover({
        value: value
      });
    };
    $scope.onKeydown = function(evt) {
      if (/(37|38|39|40)/.test(evt.which)) {
        evt.preventDefault();
        evt.stopPropagation();
        return $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? {
          1: -1
        } : void 0));
      }
    };
    this.render = function() {
      return $scope.value = ngModelCtrl.$viewValue;
    };
    return this;
  }).directive('rating', function() {
    return {
      restrict: 'EA',
      require: ['rating', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      template: '<ul class="rating" ng-mouseleave="reset()" ng-keydown="onKeydown($event)">' + '<li ng-repeat="r in range track by $index" ng-click="rate($index + 1)"><i class="icon" ng-class="$index < value && (r.stateOn || \'ion-android-star\') || (r.stateOff || \'ion-android-star-outline\')"></i></li>' + '</ul>',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var ngModelCtrl, ratingCtrl;
        ratingCtrl = ctrls[0];
        ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          return ratingCtrl.init(ngModelCtrl);
        }
      }
    };
  });

}).call(this);

angular.module('cgwy')
    .controller('OrderListCtrl', function ($scope, $state, $ionicScrollDelegate, $filter, $ionicPopup, ProfileService, OrderService, Analytics) {
        $scope.orders = [];

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                OrderService.getOrders().then(function (orders) {
                    $scope.orders = orders;
                    $scope.ordersDisplayed = orders;
                });
            }
        });

        $scope.sortType = 0;

        $scope.sortList = function(sortType){
            $scope.sortType = sortType;

            var ordersDisplayed = [];
            if(sortType == 0) {
                ordersDisplayed = $scope.orders.slice();
            } else {
                $scope.orders.forEach(function(value) {
                    if(value.status.value == sortType) {
                        ordersDisplayed.push(value);
                    }
                });
            }

            $scope.ordersDisplayed = ordersDisplayed;

            $ionicScrollDelegate.scrollTop(true);
        }

        $scope.hasTimeout = function (order) {
            var result = false;
            var submitDate = order.submitDate;
            var date = new Date();
            var currentDate = $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');

            if (submitDate === undefined || submitDate === null) {
                result = false;
            } else {
                var _submitDate = new Date(submitDate);
                _submitDate.setDate(_submitDate.getDate()+2);
                var submitDate48Hours = $filter('date')(_submitDate, 'yyyy-MM-dd HH:mm:ss');

                if(currentDate > submitDate48Hours) {
                    result = true;
                } else if(order.status.value == -1) {
                    result = true;
                }
            }

            return result;
        };

        $scope.isShowContactBtn = function (orderSubmitDate) {  
            var result = false;
            var date = new Date();//当前时间
            var submitOrderDate = new Date(orderSubmitDate);
            submitOrderDate.setDate(submitOrderDate.getDate()+1);//订单提交时间24小时之后

            if (typeof orderSubmitDate == 'undefined' || orderSubmitDate == null) {
                result = false;
            } else {
                if (date.getHours() >= 13 && submitOrderDate.getDate() == date.getDate()) {
                    result = true;
                }
            }

            return result;
        };

        $scope.contact = function (truckerTel) {
            var contactConfirm = $ionicPopup.confirm({
                title: '确定要拨打您此单的司机电话？',
                template: '<center><font color="red" size="4.1em">' + truckerTel + '</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '拨打',
                okType: 'button-assertive'
            });
            contactConfirm.then(function (res) {
                if (res) {
                    window.open('tel:' + truckerTel, '_system');
                } else {
                    return;
                }
            });
        };
    })

angular.module('cgwy')
    .factory('OrderService', function ($http, $q, apiConfig, $state, $rootScope) {

        var service = {};

        service.getTodayOrders = function () {
            return $http({
                url: apiConfig.host + "/api/v2/today-order",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.getOrders = function () {
            return $http({
                url: apiConfig.host + "/api/v2/order",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.getOrder = function (id) {
            return $http({
                url: apiConfig.host + "/api/v2/order/" + id,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.cancelOrder = function (id) {
            return $http({
                url: apiConfig.host + "/api/v2/order/" + id,
                method: 'DELETE'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.previewOrder = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/order/preview",
                method: 'POST',
                data: array
            }).then(function (payload) {
                return payload.data;
            }, function(payload) {
                return $q.reject(payload.data);
            })
        };

        service.submitOrder = function (orderInfo) {
            return $http({
                url: apiConfig.host + "/api/v2/order-coupon",
                method: 'POST',
                data: {
                    cartRequestList: orderInfo.skuarray,
                    couponId: orderInfo.couponId
                }
            }).then(function (payload) {
                return payload.data;
            }, function(payload) {
                return $q.reject(payload.data);
            })
        };

        service.submitOrderEvaluation = function (orderId, formData) {
            return $http({
                url: apiConfig.host + "/api/v2/"+ orderId +"/evaluate",
                method: 'POST',
                data: formData
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            })
        }

        return service;
    })


angular.module('cgwy')
    .controller('ProductCtrl', function ($scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, FavoriteService, Analytics,$timeout, LocationService) {
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });

        $scope.scrollInitialized = false;

        $scope.backUrl = '/main/category';
        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        }

        if ($stateParams.categoryId) {
            $scope.categorySelectedId = $stateParams.categoryId;
        }

        $scope.back = function () {
            $location.url($scope.backUrl);
        }

        $scope.criteria = {
            categoryId: $stateParams.categoryId,
            brandId: $stateParams.brandId,
            name: $stateParams.query,
            sortProperty: $stateParams.sortProperty ? $stateParams.sortProperty : 'salesCount',
            sortDirection: $stateParams.sortDirection,

            page: 0,
            pageSize: 10
        }

        if(LocationService.getChosenCity()) {
            $scope.criteria.cityId = LocationService.getChosenCity().id;
        }

        $scope.reset = function (criteria) {
            criteria.page = 0;
            $scope.skusDisplayed = [];

            if($scope.scrollInitialized) {
                $ionicScrollDelegate.scrollTop(true);
            } else {
                $scope.scrollInitialized = true;
            }
            $scope.moreDataCanBeLoaded = true;
        }

        $scope.moreDataCanBeLoaded = true;

        $scope.total = 0;

        $scope.inProcess = [];

        $scope.loadMore = function () {
            $scope.criteria.page++;

            ProductService.findSkus($scope.criteria).then(function (data) {
                if (data.skus.length > 0) {
                    data.skus.forEach(function (sku) {
                        sku.quantity = 1;
                        $scope.skusDisplayed.push(sku);
                    });

                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        }

        $scope.sortBtnClass = 'salesCount';
        $scope.resort = function (sortProperty) {
            if (sortProperty == $scope.criteria.sortProperty) {
                if ($scope.criteria.sortDirection == 'asc') {
                    $scope.criteria.sortDirection = 'desc';
                } else {
                    $scope.criteria.sortDirection = 'asc';
                }
            } else if (sortProperty == 'salesCount') {
                $scope.criteria.sortProperty = sortProperty;
                $scope.criteria.sortDirection = 'desc';
            } else if (sortProperty == 'marketPrice') {
                $scope.criteria.sortProperty = sortProperty;
                $scope.criteria.sortDirection = 'asc';
            }

            $scope.sortBtnClass = sortProperty;

            $scope.findSkus($scope.criteria);
        }

        $scope.selectBrand = function (brandId) {
            $scope.brandSelectedId = brandId;
            if(brandId) {
                $scope.criteria.brandId = brandId;
            } else {
                $scope.criteria.brandId = null;
            }

            $scope.findSkus($scope.criteria);

            $scope.showBrands.hide();
        }

        $scope.selectCategory = function (category) {
            $scope.categorySelectedId = category.id;
            $scope.criteria.categoryId = category.id;
            $scope.category = category;

            $scope.criteria.brandId = null;

            $scope.findSkus($scope.criteria);
            $scope.groupBrands($scope.criteria);
            $scope.showCategories.hide();
        }

        $scope.brands = [];

        $scope.isSearch = true;

        if ($stateParams.categoryId) {
            CategoryService.getCategory($stateParams.categoryId).then(function (data) {
                $scope.category = data;

                CategoryService.getLevel($stateParams.categoryId).then(function (level) {
                    if (level == 3) {
                        CategoryService.getParentCategory($stateParams.categoryId).then(function (parent) {
                            if (parent) {
                                $scope.siblingCategories = parent.children;
                            }
                        });
                    } else if (level == 2) {
                        $scope.siblingCategories = data.children;
                    }
                });
            });

            $scope.isSearch = false;
        }

        $scope.skusDisplayed = [];

        $scope.findSkus = function (criteria) {
            $scope.reset(criteria);
            ProductService.findSkus(criteria).then(function (data) {
                data.skus.forEach(function (sku) {
                    sku.quantity = 1;
                    $scope.skusDisplayed.push(sku);
                });

                $scope.total = data.total;
            })

        };

        $scope.groupBrands = function(criteria) {
            ProductService.groupBrands(criteria).then(function (data) {

                var brands = [];

                brands.push({id: 0, brandName: "全部"})

                data.brands.forEach(function (brand) {
                    brands.push(brand);
                });

                $scope.brands = brands;
                $scope.brandSelectedId = $scope.brands[0].id;
            })
        }


        $scope.searchQuery = function (q) {
            if (typeof q != 'undefined') {
                $scope.criteria.categoryId = null;
                $scope.criteria.brandId = null;
                $scope.criteria.name = q;
                $scope.findSkus($scope.criteria);
            }
        }

        $scope.moreQuantity = function (sku) {
            sku.quantity = sku.quantity + 1;
        }

        $scope.lessQuantity = function (sku) {
            if (sku.quantity > 0) {
                sku.quantity = sku.quantity - 1;
            }
        }

        $scope.dial = function() {
            window.open('tel:' + sessionStorage['CSH'], '_system');
        }

        $scope.addSkuIntoCart = function (sku, quantity) {
            $scope.inProcess[sku.id] = true;
            ProfileService.getProfile().then(function (data) {

                if (data) {

                    ProfileService.getCustomerCityId().then(function(cityId) {
                        if(LocationService.getChosenCity() && cityId == LocationService.getChosenCity().id) {

                            var form = [];

                            form.push({skuId: sku.id, quantity: quantity});

                            CartService.addSkuIntoCart(form).then(function () {
                                var toast = document.getElementById('customToast');
                                toast.innerHTML = "添加成功";
                                toast.className = 'fadeIn animated';
                                $timeout(function () {
                                    toast.className = 'hide';
                                }, 2000)
                                $scope.recount();

                                $scope.inProcess[sku.id] = false;
                            }, function (err) {
                                $scope.inProcess[sku.id] = false;
                            });

                            Analytics.trackEvent('cart', 'click', 'addSku');
                        } else {
                            var toast = document.getElementById('customToast');
                            toast.style.width = "40%";
                            toast.style.left = "30%";
                            toast.innerHTML = "不支持跨城市购买";
                            toast.className = 'fadeIn animated';
                            $timeout(function () {
                                toast.className = 'hide';
                            }, 2000)
                        }
                    })

                } else {
                    var loginConfirm = $ionicPopup.confirm({
                        title: '<div ng-click="dial()"><font color="red" size="4"><strong>'+ sessionStorage['CSH'] +'</strong></font></div>',
                        template: '<center>采购产品请先注册或登录</center>',
                        cancelText: '取消',
                        cancelType: 'button-default',
                        okText: '登录/注册',
                        okType: 'button-assertive'
                    });
                    loginConfirm.then(function (res) {
                        if (res) {
                            $state.go("login");
                        } else {
                            return;
                        }
                    });

                    $scope.inProcess[sku.id] = false;
                }
            }, function(err) {
                $scope.inProcess[sku.id] = false;
            });
        }

        $scope.markFavorite = function (sku) {
            FavoriteService.markFavorite(sku).then(function () {
                var toast = document.getElementById('customToast');
                toast.style.width = "30%";
                toast.style.left = "35%";
                toast.innerHTML = "收藏成功";
                toast.className = 'fadeIn animated';

                $timeout(function(){
                    toast.className = 'hide';
                },2000)

                $ionicListDelegate.closeOptionButtons();
            });

            Analytics.trackEvent('product', 'markFavorite');
        }

        $scope.findSkus($scope.criteria);
        $scope.groupBrands($scope.criteria);

        $scope.orderItemsCount = 0;

        $scope.recount = function () {
            $scope.orderItemsCount = 0;
            CartService.getOrderItemCount().then(function (count) {
                $scope.orderItemsCount = count;
            })
        }

        $scope.recount();

        $ionicPopover.fromTemplateUrl('templates/brandPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.showBrands = popover;
        });

        $ionicPopover.fromTemplateUrl('templates/categoryPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.showCategories = popover;
        });

        $scope.gotoCart = function () {
            $state.go("cart", {backUrl: $location.url()});
        }

        $scope.showFavoriteGuide = false;

        if (!window.localStorage['isFavoriteGuideShowed']) {
            $scope.showFavoriteGuide = true;
        }

        $scope.closeFavoriteGuide = function () {
            window.localStorage['isFavoriteGuideShowed'] = true;
            $scope.showFavoriteGuide = false;
        }

        //商品详情页
        $scope.productDetail = function(skuId){
            $state.go("product-detail",{id:skuId});
        }

    })

/**
 * Created by J_RH on 2015/7/16 0016.
 */
angular.module('cgwy')
.controller('ProductDetailCtrl',function($scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, FavoriteService, Analytics,$timeout){
        //判断是否登录
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });
        //传人商品id获取数据
        if($stateParams.id){
            $scope.skuId =  $stateParams.id;
            ProductService.findSkusId($scope.skuId).then(function(data){
                $scope.product = data;
                $scope.product.quantity = 1;
                console.log(data);
            })
        }

        //返回上一页
        $scope.back = function(){
            if($stateParams.backUrl){
                $location.url($stateParams.backUrl);
            }else{
                $state.go("search",{"categoryId":$scope.product.category.id})
            }
        }

        //进入购物车
        $scope.gotoCart = function () {
            $state.go("cart", {backUrl: $location.url()});
        }

        //加入收藏
        $scope.markFavorite = function () {
            $scope.sku = $scope.product
            FavoriteService.markFavorite($scope.sku).then(function () {
                if (!$rootScope.devMode) {
                    $cordovaToast
                        .show("收藏成功", 'short', 'center')
                        .then(function (success) {
                            $ionicListDelegate.closeOptionButtons();
                        }, function (error) {
                        });
                } else {
                    var toast = document.getElementById('customToast');
                    toast.innerHTML = "收藏成功";
                    toast.className = 'fadeIn animated';
                    $timeout(function(){
                        toast.className = 'hide';
                    },2000)
                    $ionicListDelegate.closeOptionButtons();
                }

            });Analytics.trackEvent('product', 'markFavorite');
        }


        //加入购物车

        $scope.moreQuantity = function (product) {
            product.quantity = product.quantity + 1;
        }

        $scope.lessQuantity = function (product) {
            if (product.quantity > 0) {
                product.quantity = product.quantity - 1;
            }
        }

        //加入购物车
        $scope.addSkuIntoCart = function (product, quantity) {
            ProfileService.getProfile().then(function (data) {
                if (data) {
                    var form = [];

                    form.push({skuId: product.id, quantity: quantity});

                    CartService.addSkuIntoCart(form).then(function () {
                        var toast = document.getElementById('customToast');
                        toast.innerHTML = "添加成功";
                        toast.className = 'fadeIn animated';
                        $timeout(function(){
                            toast.className = 'hide';
                        },2000)
                        $scope.recount();
                    });

                    Analytics.trackEvent('cart', 'click', 'addSku');
                } else {
                    var loginConfirm = $ionicPopup.confirm({
                        title: '<font color="red" size="4"><strong>400-898-1100</strong></font>',
                        template: '<center>采购产品请先注册，或与我们联系！</center>',
                        cancelText: '取消',
                        cancelType: 'button-default',
                        okText: '登录/注册',
                        okType: 'button-assertive'
                    });
                    loginConfirm.then(function (res) {
                        if (res) {
                            $state.go("login");
                        } else {
                            return;
                        }
                    });
                }
            });
        }

        //显示购物车有多少件物品
        $scope.orderItemsCount = 0;
        $scope.recount = function () {
            $scope.orderItemsCount = 0;
            CartService.getOrderItemCount().then(function (count) {
                $scope.orderItemsCount = count;
            })
        }

        $scope.recount();

    })
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

        return service;
    })
angular.module('cgwy')
    .factory('AlertService', function ($http, $ionicPopup) {
        
        var service = {};

        service.alertMsg = function (msg) {
            return $ionicPopup.alert({
                title: '提示信息',
                template: '<center><div style="font-size:1.1em">'+ msg +'</div></center>',
                okText: '确定',
                okType: 'button-assertive'
            });
        };

        return service;
    })


angular.module('cgwy')
    .controller('LoginCtrl', function ($scope, $rootScope, $state, $ionicPopup, ProfileService, WxReadyService, ProductService, FavoriteService, ActivityService, Analytics, AlertService) {
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
                var deviceId = ProfileService.getDeviceId();
                ProfileService.bindDevice(currentPlatform, deviceId);

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

angular.module('cgwy')
    .controller('ProfileCtrl', function ($scope, $rootScope, $state, $ionicPopup, ProfileService, CartService, ActivityService, Analytics,WxReadyService) {
        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (profile) {
            	$scope.currentLoginCityId = profile.cityId;
//  				if(profile.block) {
//                     $scope.currentLoginCityId = profile.city.id;
//                 } else if(profile.zone) {
//                     $scope.currentLoginCityId = profile.zone.warehouse.city.id;
//                 }
            } else {
                $scope.hasRestaurants = true;
            }
        });
        // WxReadyService.isWeChat(function () {
        //     wx.hideAllNonBaseMenuItem();
        // });
        ProfileService.getRestaurants().then(function (data) {
            $scope.restaurants = data;

            if ($scope.restaurants && $scope.restaurants.length > 0) {
                $scope.hasRestaurants = true;
            } else {
                $scope.hasRestaurants = false;
            }
        });
        $scope.logout = function () {
            var logoutConfirm = $ionicPopup.confirm({
                title: '确认信息',
                template: '<center><font size="4.1em">确定退出登录？</font></center>',
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
                        $scope.hasRestaurants = true;
                    });

                } else {
                    return;
                }
            });
        };

        $scope.complain = function () {
            var complainConfirm = $ionicPopup.confirm({
                title: '确认信息',
                template: '<center><font size="4.1em">确定投诉客服？</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            complainConfirm.then(function (res) {
                if (res) {
                    //TODO ... android toast
                } else {
                    return;
                }
            });
        };

        $scope.servicePhone = window.sessionStorage['CSH'];

        $scope.dial = function (telephone) {
            var serviceConfirm = $ionicPopup.confirm({
                title: '确定要拨打的客服专员电话',
                template: '<center><font color="red" size="4.1em">' + telephone + '</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '拨打',
                okType: 'button-assertive'
            });
            serviceConfirm.then(function (res) {
                if (res) {
                    window.open('tel:' + telephone, '_system')
                } else {
                    return;
                }
            });
        }

        if(ionic.Platform.isWebView()) {
            $scope.feedbackAvailable = true;
        }
    })

angular.module('cgwy')
    .factory('ProfileService', function ($http, $q, apiConfig, Analytics, rfc4122) {

        var service = {};

        var UNKNOWN = new Object();

        service.setDisplayWelcome = function (displayWelcome) {
            service.displayWelcome = displayWelcome;
        }

        service.isDisplayWelcome = function () {
            return service.displayWelcome;
        }

        service.getProfile = function () {
            if (service.profile) {
                var deferred = $q.defer();

                if (service.profile === UNKNOWN) {
                    Analytics.set('userId', null);
                    deferred.resolve(null);
                } else {
                    Analytics.set('userId', service.profile.id);
                    deferred.resolve(service.profile);
                }
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/customer",
                    method: 'GET'
                }).then(function (payload) {
                    service.profile = payload.data;
                    Analytics.set('userId', service.profile.id);
                    return service.profile;
                }, function (error) {
                    console.log(error);
                    Analytics.set('userId', null);
                    service.profile = UNKNOWN;
                    return null;
                })
            }
        };

        service.getCustomerCityId = function() {
            var cityId = 1;

            if (service.profile && service.profile.block) {
                var deferred = $q.defer();

                deferred.resolve(service.profile.block.city.id);
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/customer",
                    method: 'GET'
                }).then(function (payload) {
                    service.profile = payload.data;
                    if(service.profile.block) {
                        cityId = service.profile.block.city.id;
                    } else if(service.profile.zone) {
                        cityId = service.profile.zone.warehouse.city.id;
                    }

                    return cityId;
                }, function (error) {
                    return cityId;
                })
            }
        }

        service.anyValidatedRestaurants = function (restaurants) {
            var anyValidatedRestaurants = false;
            restaurants.forEach(function (r) {
                if (r.status.value == 2) {
                    anyValidatedRestaurants = true;
                }
            });

            return anyValidatedRestaurants;
        }

        service.containsValidatedRestaurants = function () {
            if (service.restaurants) {
                var deferred = $q.defer();
                deferred.resolve(service.anyValidatedRestaurants(service.restaurants));
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/restaurant",
                    method: 'GET'
                }).then(function (payload) {
                    service.restaurants = payload.data;
                    return service.anyValidatedRestaurants(service.restaurants);
                }, function (error) {
                    console.log(error);
                    return false;
                })
            }
        };

        service.checkUserName = function (username) {
            return $http({
                url: apiConfig.host + "/api/v2/check-username",
                method: 'GET',
                params: {username: username}
            }).then(function () {
            }, function (payload) {
                return $q.reject(payload.data)
            })
        };

        service.coupon = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/coupon",
                method: 'GET'
            }).then(function (data) {
                return data;
            }, function (payload) {
                return $q.reject(payload.data)
            })
        }

        service.couponEdit = function (skuId) {
            return $http({
                url: apiConfig.host + "/api/v2/order/available-coupon",
                method: 'POST',
                data: skuId
            }).then(function (data) {
                return data;
            }, function (payload) {
                return $q.reject(payload.data)
            })
        }

        service.getRestaurants = function () {
            // if (service.restaurants) {
            //     var deferred = $q.defer();
            //     deferred.resolve(service.restaurants);
            //     return deferred.promise;
            // } else {
                return service.forceRefreshRestaurants();
            // }
        };


        service.forceRefreshRestaurants = function () {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant",
                method: 'GET'
            }).then(function (payload) {
                service.restaurants = payload.data;
                return payload.data;
            }, function (error) {
                console.log(error);
                return [];
            })
        }


        service.getRestaurant = function (id) {
            return service.getRestaurants().then(function (restaurants) {
                for (var i = 0; i < restaurants.length; i++) {
                    if (restaurants[i].id == id) {
                        return restaurants[i];
                    }
                }

                return null;
            })
        };

        service.updateRestaurant = function (restaurant) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant/" + restaurant.id,
                method: 'PUT',
                data: {
                    id: restaurant.id,
                    name: restaurant.name,
                    realname: restaurant.receiver,
                    telephone: restaurant.telephone
                }
            }).then(function (payload) {
                return payload.data;
            })

        };


        service.login = function (user) {
            return $http({
                url: apiConfig.host + "/api/v2/login",
                method: 'POST',
                data: user
            }).then(function (payload) {
                service.profile = payload.data;

                // set user id
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id
                Analytics.set('userId', service.profile.id);

                window.localStorage['cachedUsername'] = service.profile.username;

                return service.profile;
            }, function (payload) {
                if(payload.status === 0) {
                    return $q.reject({errno : -1, errmsg: "网络异常"})
                }

                if (payload.data) {
                    return $q.reject(payload.data);
                }

            })
        };

        service.logout = function () {
            return $http({
                url: apiConfig.host + "/api/v2/logout",
                method: 'GET'
            }).then(function () {
                service.profile = null;
                service.restaurants = null;

                // set user id
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id
                Analytics.set('userId', null);
            })
        };

        service.register = function (user) {
            return $http({
                url: apiConfig.host + "/api/v2/register",
                method: 'POST',
                data: user
            }).then(function (payload) {
                service.profile = null;
                service.getProfile();
                return payload.data;
            }, function (payload) {
                if (payload.data) {
                    return $q.reject(payload.data);
                }
            })
        };

        service.askCode = function (telephone) {
            return $http({
                url: apiConfig.host + "/api/v2/code",
                method: 'GET',
                params: {telephone: telephone}
            })
        };

        service.transformRequest = function (obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        }


        service.checkCode = function (telephone, code) {
            return $http({
                url: apiConfig.host + "/api/v2/code",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {telephone: telephone, code: code}
            }).then(function (payload) {
                return payload.data;
            }, function (error) {
                return $q.reject(error.data);
            })
        };

        service.resetPassword = function (telephone, code, password) {
            return $http({
                url: apiConfig.host + "/api/v2/" + telephone + "/reset-password",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {code: code, password: password}
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.couponInfo = [];
        service.setCouponInfo = function (couponInfo) {
            service.couponInfo = couponInfo;
        };
        service.bindBaiduPush = function (platform, baiduChannelId) {
            if (baiduChannelId) {
                service.baiduChannelId = baiduChannelId;
            }

            if (service.baiduChannelId) {
                service.getProfile().then(function (profile) {
                    if (profile) {
                        return $http({
                            url: apiConfig.host + "/api/v2/push",
                            method: 'PUT',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            transformRequest: service.transformRequest,
                            data: {baiduChannelId: service.baiduChannelId, platform: platform}
                        })
                    }
                })
            }
        }

        service.getCouponInfo = function () {
            return service.couponInfo;
        };

        service.createRestaurant = function (restaurant) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant",
                method: 'POST',
                data: restaurant
            }).then(function (payload) {
                service.forceRefreshRestaurants();
                return payload.data;
            }, function (error) {
                return $q.reject(error.data);
            })
        }

        service.getDeviceId = function () {
            if (window.localStorage['deviceId']) {
                console.log('deviceId:' + window.localStorage['deviceId']);
                return window.localStorage['deviceId'];
            } else {
                window.localStorage['deviceId'] = rfc4122.v4();
                console.log('deviceId:' + window.localStorage['deviceId']);
                return window.localStorage['deviceId'];
            }
        }

        service.bindDevice = function (platform, deviceId) {
            if (deviceId) {
                return $http({
                    url: apiConfig.host + "/api/v2/device",
                    method: 'PUT',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: service.transformRequest,
                    data: {deviceId: deviceId, platform: platform}
                })
            }
        }

        return service;
    })
angular.module('cgwy')
    .controller('RegisterCtrl', function ($scope, $state, $ionicPopup, $stateParams, ProfileService, LocationService, RestaurantService, Analytics, AlertService, MapService) {

        $scope.cities = [];
        $scope.regions = [];
        $scope.zones = [];
		
  		$scope.form = MapService.getViewModel();
  		if($scope.form == undefined){
			$scope.form = {
				containsRestaurant: true,
				telephone: '',
				password: '',
				repeatPassword: '',
				cityId: null,
				cityName: "北京",
				regionId: null,

				restaurantName: '',
				receiver: '',
				restaurantAddress: '',
				restaurantStreetNumber: '',
				license: '',
				restaurantType: null,
				lat:null,
				lng:null
			};
  		}

		$scope.toMap = function() {
			$state.go('map',{});
			MapService.setViewModel($scope.form);
		}
				
        if ($stateParams.sharerId) {
            $scope.form.sharerId = $stateParams.sharerId;
        }
            
        RestaurantService.getRestaurantTypes().then(function(restaurantTypes) {
            $scope.restaurantTypes = restaurantTypes;
        })

        LocationService.getCities().then(function (cities) {
            $scope.cities = cities;

//             $scope.allCities = [];
//             $scope.allRegions = [];
//             $scope.allZones = [];
// 
//             $scope.allCities = cities;
           //  cities.forEach(function(c) {
//                 c.regions.forEach(function(r) {
//                     $scope.allRegions.push(r);
// 
//                     r.zones.forEach(function(z) {
//                         $scope.allZones.push(z);
//                     })
//                 })
//             });

            if($scope.cities.length == 1) {
                $scope.form.cityId = $scope.cities[0].id;
                $scope.form.cityName = $scope.cities[0].name;
            } else {
            	//在首次进入注册页面,进行定位.从地图页面回跳不做定位处理直接回显
                if($scope.form.cityId == null && LocationService.getChosenCity()) {
                    $scope.form.cityId = LocationService.getChosenCity().id;
                    $scope.form.cityName = LocationService.getChosenCity().name;
                }
            }
            
            //页面数据回显控制
            selectRegion($scope.form.cityId);
        });

        $scope.checkUserName = function(username) {
            ProfileService.checkUserName(username).then(function() {}, function(error) {
                if(data.errmsg) {
                    AlertService.alertMsg(data.errmsg);
                }
            })
        }

        $scope.register = function(form) {
			
            if(form.telephone === "") {
                AlertService.alertMsg("请填写手机号");
                return;
            } 
            if(form.telephone.length != 11) {
                AlertService.alertMsg("请填写规范号码");
                return;
            }
            if(form.password === "") {
                AlertService.alertMsg("请填写密码");
                return;
            }
            if(form.password.length < 6 || form.password.length > 12) {
                AlertService.alertMsg("请设置6-12位英文/数字/符号密码");
                return;
            }
            if(form.repeatPassword === "") {
                AlertService.alertMsg("请确认密码");
                return;
            }
            if(form.repeatPassword != form.password) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }
            if(form.cityId == null) {
                AlertService.alertMsg("请选择您餐馆所在的城市");
                return;
            }
// 			if(form.regionId == null) {
//                 AlertService.alertMsg("请选择餐馆所在区域");
//                 return;
//             }
//             if(form.zoneId == null) {
//                 AlertService.alertMsg("请选择餐馆所在商圈");
//                 return;
//             }
            /*有店*/
            if(form.containsRestaurant == true) {
                if(form.restaurantName === "") {
                    AlertService.alertMsg("请填写餐馆名称");
                    return;
                }
                if(form.receiver === "") {
                    AlertService.alertMsg("请填写收货人");
                    return;
                }
                if(form.restaurantAddress === "") {
                    AlertService.alertMsg("请填写详细地址");
                    return;
                }
                // if(form.restaurantType == null) {
//                     AlertService.alertMsg("请选择餐馆类型");
//                     return;
//                 }
            };

            ProfileService.register(form).then(function(data) {
                Analytics.trackEvent('profile', 'register', 'success', 1);
				MapService.delViewModel(); //清空地图Service中保留的ViewModel数据

                if ($stateParams.sharerId) 
                    $state.go("regist-success",{sharerId:$stateParams.sharerId});
                else 
                    $state.go("regist-success");
            }, function(data) {
                Analytics.trackEvent('profile', 'register', 'failure', 1);

                AlertService.alertMsg(data.errmsg);
            });
        }


      	$scope.$watch('form.cityId', selectRegion);
		function selectRegion (cityId){
            if($scope.cities) {
                for (var i = 0; i < $scope.cities.length; i++) {
                    var city = $scope.cities[i];
                    if (city.id == cityId) {
                        $scope.city = city;
                        $scope.form.cityName = city.name;
                    }
                }
            }
        }

//         $scope.$watch('form.regionId', selectZone);
//         function selectZone (regionId){
//         	if($scope.allRegions) {
//                 for (var i = 0; i < $scope.allRegions.length; i++) {
//                     var region = $scope.allRegions[i];
//                     if (region.id == regionId) {
//                         $scope.region = region;
// 
//                         $scope.zones = region.zones;
//                     }
//                 }
//             }
//         }

        $scope.hasContainsRestaurant = function(arg) {
            $scope.form.containsRestaurant = arg;
        } 

    })

angular.module('cgwy')
    .controller('SuccessCtrl', function ($scope, $stateParams, ProfileService) { 
    	
    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });

    	if ($stateParams.sharerId)
    		$scope.isShareRegistSuccess = true;
    	else
    		$scope.isShareRegistSuccess = false;

    	$scope.downloadApp = function () {
    		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.mirror.cgwy";
    	}

        $scope.servicePhone = window.sessionStorage['CSH'];
    });
/**
 * @file angular-uuid-service is a tiny standalone AngularJS UUID/GUID generator service that is RFC4122 version 4 compliant.
 * @author Daniel Lamb <dlamb.open.source@gmail.com>
 */
angular.module('uuid', []).factory('rfc4122', function () {
    function getRandom(max) {
        return Math.random() * max;
    }

    return {
        v4: function () {
            var id = '', i;

            for(i = 0; i < 36; i++)
            {
                if (i === 14) {
                    id += '4';
                }
                else if (i === 19) {
                    id += '89ab'.charAt(getRandom(4));
                }
                else if(i === 8 || i === 13 || i === 18 || i === 23) {
                    id += '-';
                }
                else
                {
                    id += '0123456789abcdef'.charAt(getRandom(16));
                }
            }
            return id;
        }
    };
});

angular.module('cgwy')
    .controller('coupon', function ($scope, $state, ProfileService) { 
    	
        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.coupon().then(function (data) {
                    $scope.coupons = data.data;
                });
            }
        });
    });


angular.module('cgwy')
    .controller('couponEditCtrl', function ($scope,$state,AlertService, $stateParams,ProfileService) { 
    	$scope.couponInfo = [];
        $scope.couponInfo = ProfileService.getCouponInfo();
        // $scope.couponInfo.forEach(function(couponItem){
        // 	couponItem.chosen=false;
        // })
        $scope.back = function(){
        	$state.go("confirm");
        }
        $scope.toggle = function(couponItem){
        	
        	if ($scope.couponInfo) {
        		$scope.couponInfo.forEach(function(value) {
        			if (value != couponItem) {
        				value.chosen = false;
        			};
        		})
        	};

        }
        $scope.submitCoupon = function (){

        	var couponId = null;

        	$scope.couponInfo.forEach(function(couponItem){
        		if( couponItem.chosen == true ){
        			couponId = couponItem.id;
        		}
        	})
        	if( couponId != null ){
        		$state.go("confirm",{
	        		"cId":couponId
	        	});
        	} else {
        		AlertService.alertMsg("请选择优惠券");
        	}
        }
        
    });
angular.module('cgwy')
	.controller('AddRestaurantCtrl', function ($scope, $state, ProfileService, LocationService, RestaurantService, AlertService) {

        $scope.restaurant = {
        	restaurantName: "",
        	restaurantAddress: "",
            receiver: "",
            restaurantType: null
        };

        RestaurantService.getRestaurantTypes().then(function(restaurantTypes) {
            $scope.restaurantTypes = restaurantTypes;
        })

        $scope.addRestaurant = function (restaurant) {
        	if(restaurant.restaurantName === "") {
                AlertService.alertMsg("请填写您的餐馆名称");
                return;
            }
            if(restaurant.restaurantAddress === "") {
                AlertService.alertMsg("请填写餐馆地址");
                return;
            }
            if(restaurant.receiver === "") {
                AlertService.alertMsg("请填写收货人");
                return;
            }
            if(restaurant.restaurantType == null) {
                AlertService.alertMsg("请选择餐馆类型");
                return;
            }

            ProfileService.createRestaurant(restaurant).then(function(restaurant) {
                AlertService.alertMsg("餐馆注册成功，我们会尽快审核").then(function() {
                    $state.go('restaurant-list');
                });
            }, function(data) {
                if(data.errmsg) {
                    AlertService.alertMsg(data.errmsg);
                }
            })
        }

	});
angular.module('cgwy')
    .controller('RestaurantDetailCtrl', function ($scope, $state, ProfileService, $stateParams, Analytics, AlertService) {

        $scope.restaurant = {
            name: '',
            receiver: '',
            telephone: ''
        }

        ProfileService.getRestaurant($stateParams.id).then(function (data) {
            $scope.restaurant = data;
        });

        $scope.updateRestaurant = function(restaurant) {
            if(restaurant.name === "") {
                AlertService.alertMsg("请填写餐馆名称");
                return;
            }
            if(restaurant.receiver === "") {
                AlertService.alertMsg("请填写收货人");
                return;
            }
            if(restaurant.telephone === "") { 
                AlertService.alertMsg("请填写手机号");
                return;
            }
            if(restaurant.telephone.length != 11) {
                AlertService.alertMsg("请填写规范号码");
                return;
            }

            ProfileService.updateRestaurant(restaurant).then(function(data) {
                $scope.restaurant = data;

                $state.go('restaurant-list');
            });
        }
    })

angular.module('cgwy')
    .controller('RestaurantListCtrl', function ($scope, $state, ProfileService, Analytics) {

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.getRestaurants().then(function (data) {
                    $scope.restaurants = data;

                    if ($scope.restaurants && $scope.restaurants.length > 0) {
                        $scope.hasRestaurants = true;
                    } else {
                        $scope.hasRestaurants = false;
                    }
                });
            }
        });

        $scope.isToEdit = function(restaurant) {
            if (restaurant.status.value == 2) {
                $state.go('restaurant-detail',{id:restaurant.id});
            }            
        }

    })

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


angular.module('cgwy')
    .controller('SearchCtrl', function ($scope, $ionicPopup, $state, $stateParams) {

    	$scope.query = { keywords : "" };

        $scope.backUrl = '/main/category';
        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        }

    	$scope.historyQuery = [];
    	$scope.localStorageHistoryQuery = [];

    	$scope.$watch('query.keywords', function (newVal) {
            if($scope.query.keywords != undefined && $scope.query.keywords != "") {
                $scope.hasQuery = true;
            }else {
                $scope.hasQuery = false;
            }
        })

    	$scope.clearQuery = function () {
            $scope.query.keywords = "";
        }

        $scope.toQuerySearch = function () {
        	if ($scope.query.keywords) {
        		$scope.historyQuery = JSON.parse(window.localStorage.getItem('historyQuery') || '[]');

                var historyQueryLength = $scope.historyQuery.length;

        		if (historyQueryLength > 0 && historyQueryLength < 10) {
                    $scope.setLocalStorageHistoryQuery();
        		} else if (historyQueryLength == 0) {
                    $scope.historyQuery.push($scope.query.keywords);

                    window.localStorage['historyQuery'] = JSON.stringify($scope.historyQuery);
                } else if (historyQueryLength >= 10) {
                    $scope.historyQuery.splice(0,1);

                    $scope.setLocalStorageHistoryQuery();
                }

                //categoryId:undefined 在使用软键盘的搜索按钮时,会带着categoryId参数,所以需要在此置空改参数,否则不会执行全局搜索商品  by linsen
                $state.go('search',{backUrl: $scope.backUrl,query: $scope.query.keywords,categoryId:undefined});
        	}
        }

        $scope.setLocalStorageHistoryQuery = function () {
            for (var i=0; i < $scope.historyQuery.length; i++) {
                if ($scope.query.keywords == $scope.historyQuery[i]) {
                    $scope.historyQuery.splice(i,1);
                } 
            }   

            $scope.historyQuery.push($scope.query.keywords);

            window.localStorage['historyQuery'] = JSON.stringify($scope.historyQuery);
        }
 
        var localStorageHistoryQueryArr = JSON.parse(window.localStorage.getItem('historyQuery') || '[]');

        if (localStorageHistoryQueryArr.length > 0) {
        	for (var i=0; i < localStorageHistoryQueryArr.length; i++) {
        		$scope.localStorageHistoryQuery.push(localStorageHistoryQueryArr[i]);
        	}

            $scope.hasHistoryQuery = true;

            $scope.localStorageHistoryQuery.reverse();
        } else {
            $scope.localStorageHistoryQuery = [];

            $scope.hasHistoryQuery = false;
        }
    

    	$scope.clearHistoryQuery = function () {
    		var clearConfirm = $ionicPopup.confirm({
                title: '确认信息',
                template: '<center><font size="4.1em">您确定清空所有历史搜索？</font></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            clearConfirm.then(function (res) {
                if (res) {
                    while($scope.localStorageHistoryQuery.length > 0) {
                    	$scope.localStorageHistoryQuery.pop();
                    }

                    $scope.hasHistoryQuery = false;

                    window.localStorage.removeItem('historyQuery');
                } else {
                    return;
                }
            });
    	}

    })
angular.module('cgwy')
    .controller('ShareCtrl', function ($scope, $state, ProfileService,WxReadyService) {

    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else if (profile.id) {
                $scope.sharerId = profile.id;

                // 分享至微信－文案配置项
                $scope.title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元红包！";
                $scope.description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
                $scope.imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
                $scope.webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + $scope.sharerId;
				//$scope.webpageUrl = encodeURIComponent("http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId="+$scope.sharerId);
                $scope.webpageUrlEncode = encodeURIComponent($scope.webpageUrl);
                // WxReadyService.isWeChat(function () {
                //     var shareData = {
                //         title: $scope.title,
                //         desc: $scope.description,
                //         link: $scope.webpageUrl,
                //         imgUrl: $scope.imgUrl
                //     };
                //     wx.showAllNonBaseMenuItem();
                //     wx.onMenuShareAppMessage(shareData);
                //     wx.onMenuShareTimeline(shareData);
                //     wx.onMenuShareQQ(shareData);
                //     wx.onMenuShareQZone(shareData);
                // });
                // 分享至微信好友
                $scope.toWeChatFriends = function () {
                    if (window.device) {
                        // 微信开放平台－open
                        Wechat.share({
                            message: {
                                title: $scope.title,
                                description: $scope.description,
                                thumb: $scope.imgUrl,
                                mediaTagName: "",
                                messageExt: "",
                                media: {
                                    type: Wechat.Type.LINK,
                                    webpageUrl: $scope.webpageUrl
                                }
                            },
                            scene: Wechat.Scene.SESSION
                        }, function () {

                        }, function (reason) {
                            console.log("Failed: " + reason);
                        });
                    } else {
                        // 微信公众平台－mp
                        // wx.onMenuShareAppMessage({
                        //     title: $scope.title,
                        //     desc: $scope.description,
                        //     link: $scope.webpageUrl,
                        //     imgUrl: $scope.imgUrl,
                        //     type: 'link',
                        //     dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        //     success: function (res) {
                        //         // 用户确认分享后执行的回调函数
                        //         alert(res+"ok");
                        //     },
                        //     cancel: function () {
                        //         // 用户取消分享后执行的回调函数
                        //     }
                        // });
                        fxGuidePage.style.display = "block";
                    }
                }

                // 分享至微信朋友圈
                $scope.toWeChatTimeline = function () {
                    if (window.device) {
                        Wechat.share({
                            message: {
                                title: $scope.title,
                                description: "",
                                thumb: $scope.imgUrl,
                                mediaTagName: "",
                                messageExt: "",
                                media: {
                                    type: Wechat.Type.LINK,
                                    webpageUrl: $scope.webpageUrl
                                }
                            },
                            scene: Wechat.Scene.TIMELINE
                        }, function () {

                        }, function (reason) {
                            console.log("Failed: " + reason);
                        });
                    } else {
                        fxGuidePage.style.display = "block";
                        // wx.onMenuShareTimeline({
                        //     title: $scope.title,
                        //     link: $scope.webpageUrl,
                        //     imgUrl: $scope.imgUrl,
                        //     success: function () {
                        //         // 用户确认分享后执行的回调函数
                        //     },
                        //     cancel: function () {
                        //         // 用户取消分享后执行的回调函数
                        //     }
                        // });
                    }
                }
            }
        });
        var fxGuidePage = document.getElementById('fxGuidePage'),
            hideBtn = document.getElementById('hideBtn');
        $scope.fxGuidePageFun = function(){
            hideBtn.onclick = function(){
                fxGuidePage.style.display = "none";
            }
        }
        $scope.fxGuidePageFun();

        // 分享至短信
    	$scope.toSendMessage = function () {
            var message = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还能赚钱！http://www.canguanwuyou.cn/www/#/share-page?sharerId=" + $scope.sharerId;
            var ua = navigator.userAgent.toLowerCase();
            var url;
        
            if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 
                || (ua.indexOf('Safari') != -1 && ua.indexOf('Chrome') == -1))
                url = "sms:&body=" + encodeURIComponent(message);
            else
                url = "sms:?body=" + encodeURIComponent(message);

            window.location.href = url;
    	}


    });
angular.module('cgwy')
    .controller('SharePageCtrl', function ($scope, $stateParams) {

    	if ($stateParams.sharerId) {
    		$scope.sharerId = $stateParams.sharerId;
    	}
    	
    });
angular.module('cgwy')
    .factory('UpdateService', ['$log', '$q', 'apiConfig', function ($log, $q, apiConfig) {
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

        return service;

    }])

angular.module('cgwy')
    .factory('VersionService', function ($http, $q, apiConfig) {
        var service = {};

        service.checkApp = function(versionCode) {

            if(versionCode) {
                return $http({
                    url: apiConfig.host + "/api/v2/version/update",
                    method: 'GET',
                    params: {versionCode: versionCode}
                }).then(function (payload) {
                    if (payload.data) {
                        if (payload.data.versionCode > versionCode) {
                            return payload.data;
                        }
                    }

                    return null;
                })
            } else {
                var deferred = $q.defer();
                deferred.resolve(null);
                return deferred.promise;
            }
        }
        return service;
    })

angular.module('cgwy')
    .factory('WxReadyService', function ($http, $q, apiConfig, $rootScope) {
        var service = {};

        service.wxConfig = function (callback) {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                // return true;
                return callback();
            } else {
                // console.log("config 1");
                return false;
            }
        }

        service.isWeChat = function (callback) {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {

                wx.ready(function () {
                    callback();
                });

                return true;
            } else {
                // console.log('isWeChat');
                return false;
            }
        }
        service.wxOnMenuShare = function (sharerId){
            var title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元红包！";
            var description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
            var imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
            var webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + sharerId;
            service.isWeChat(function () {
                var shareData = {
                    title: title,
                    desc: description,
                    link: webpageUrl,
                    imgUrl: imgUrl
                };
                wx.showAllNonBaseMenuItem();
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareQQ(shareData);
                wx.onMenuShareQZone(shareData);
            });
        }
        // console.log(service.getAccess_token());
        return service;
    })
angular.module('cgwy')
    .factory('WxTokenService', function ($http, $q, apiConfig, $rootScope) {
        var service = {};
        service.getAccess_token = function () {
            return  $http({
                url: "http://www.canguanwuyou.cn/wechat",
                method: 'GET'
            }).then(function (wechatToken) {
                return wechatToken;
            });
        }
        // console.log(service.getAccess_token());
        return service;
    })
angular.module('cgwy')
    .controller('WelcomeCtrl', function ($scope, $state) {
        if(window.localStorage['isWelcomeShowed']) {
            $state.go("main.home");
        }

        $scope.goHome = function() {
            window.localStorage['isWelcomeShowed'] =  true;
            $state.go("main.home");
        }

    });
