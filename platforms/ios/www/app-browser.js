// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

function initialize() {
    var elem = angular.element(document.querySelector('#custom')); //get your angular element
    var injector = elem.injector(); //get the injector.
    // var MapService = injector.get('MapService'); //get the service.
    // MapService.geolocation(); //定位
}

angular.module('ngIOS9UIWebViewPatch', ['ng']).config(function ($provide) {
    $provide.decorator('$browser', ['$delegate', '$window', function ($delegate, $window) {

        if (isIOS9UIWebView($window.navigator.userAgent)) {
            return applyIOS9Shim($delegate);
        }

        return $delegate;

        function isIOS9UIWebView(userAgent) {
            return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
        }

        function applyIOS9Shim(browser) {
            var pendingLocationUrl = null;
            var originalUrlFn = browser.url;

            browser.url = function () {
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
        // "host": "http://www.canguanwuyou.cn"
        // "host":"http://121.42.176.228:8083",
        "host": "",
        "environment": "develop"
    })

    .run(function ($state, $window, $ionicPlatform, DeviceUtil, $ionicPopup, $ionicLoading, NetworkUtil, BackUrlUtil, WxReadyService, WxTokenService, CartService, ProfileService, $rootScope, $ionicHistory, FavoriteService, UpdateService, VersionService, ActivityService, AlertService, MapService, $cordovaToast, $interval, $cordovaFileTransfer, $cordovaFileOpener2, $timeout, $cordovaBadge) {
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

            if (NetworkUtil.getNetworkRs()) {
                var updateObject = function () {
                    UpdateService.updateApp().then(function (result) {
                        $ionicLoading.hide();
                        if (result == 2) {
                            //loading界面
                            $ionicPopup.confirm({
                                template: '<center>数据更新失败请点击[重试],否则会影响您使用!</center>',
                                cancelText: '取消',
                                cancelType: 'button-default',
                                okText: '重试',
                                okType: 'button-assertive'
                            }).then(function (res) {
                                if (res) {
                                    $ionicLoading.show({
                                        template: '数据更新中请保持网络通畅!'
                                    });
                                    updateObject();
                                } else {
                                    return;
                                }
                            });
                        }
                    });
                }
                updateObject();
            }

            //加载百度地图API JS
            var script = document.createElement("script");
            script.src = "http://api.map.baidu.com/api?v=2.0&ak=kTPXBr7VXv7vaheBEHjiVsYK&callback=initialize";
            document.body.appendChild(script);

            var currentPlatform = ionic.Platform.platform();
            var currentPlatformVersion = ionic.Platform.version();
            DeviceUtil.getDeviceId();
            ProfileService.setDisplayWelcome(true);

            try{
                window.plugins.jPushPlugin.init();
            }catch(e){
                console.log("JPush plugin is undefined");
            }
            if(ionic.Platform.isWebView()){
                cordova.getAppVersion.getVersionCode(function (versionCode) {
                    VersionService.versionCode = versionCode;
                    VersionService.checkApp(versionCode).then(function (ver) {
                        //if(ver){
                        //    if(ionic.Platform.isAndroid()){
                        //        var cancelText = ver.forceUpdate ? "退出" : "取消";
                        //        $ionicPopup.confirm({
                        //            template: '<center>版本已最新,是否升级？</center>',
                        //            cancelText: cancelText, cancelType: 'button-default',
                        //            okText: '升级', okType: 'button-assertive'
                        //        }).then(function (res) {
                        //            if (res) {
                        //                $ionicLoading.show({template: "已经下载：0%"});
                        //                var url = ver.url;
                        //                var targetPath = cordova.file.externalApplicationStorageDirectory + 'cgwy/cgwy_' + versionCode + '.apk';
                        //                var trustHosts = true;
                        //                var options = {};
                        //                $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                        //                    .then(function (result) {
                        //                        // 打开下载下来的APP
                        //                        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive')
                        //                            .then(function () {
                        //                            }, function (err) {
                        //                                $ionicPopup.alert({template: '<center>文件打开失败,请稍后重试!</center>', okText: '确定', okType: 'button-light'});
                        //                                $ionicLoading.hide();
                        //                            });
                        //                        $ionicLoading.hide();
                        //                    }, function (err) {
                        //                        $ionicPopup.alert({template: '<center>当前网络不稳定,下载失败!</center>', okText: '确定', okType: 'button-light'});
                        //                        $ionicLoading.hide();
                        //                    }, function (progress) {
                        //                        $timeout(function () {
                        //                            var downloadProgress = (progress.loaded / progress.total) * 100;
                        //                            $ionicLoading.show({template: "已经下载：" + Math.floor(downloadProgress) + "%"});
                        //                            if (downloadProgress > 99) {
                        //                                $ionicLoading.hide();
                        //                            }
                        //                        })
                        //                    });
                        //            } else {
                        //                //取消或者退出
                        //                if(ver.forceUpdate == true)
                        //                    ionic.Platform.exitApp();
                        //                return;
                        //            }
                        //        });
                        //    }else if(ionic.Platform.isIOS()){
                        //        $ionicPopup.alert({
                        //            template: '<center>版本已经更新,请到App store市场下载!</center>', okText: '确定', okType: 'button-light'
                        //        });
                        //    }
                        //}
                    });
                });
            }

            document.addEventListener("resume", function () {
                $cordovaBadge.clear().then(function () {
                    // You have permission, badge cleared.
                }, function (err) {
                    // You do not have permission.
                });
            }, false);

            if (window.device) {
                var baidu_push_api_key = ionic.Platform.isIOS() ? 'QGi7yYY00oNPIe0Ug2gx1zZd' : 'zdfuy34n1x9XWmmGQiuhgP3q';
                console.log('startWork');

                if (typeof baidu_push !== 'undefined') {
                    baidu_push.startWork(baidu_push_api_key, function (json) {
                        // 将channelId和userId存储，待用户登录后回传服务器
                        if (ionic.Platform.isIOS()) {
                            userId = json.user_id;
                            channelId = json.channel_id;
                            console.log("ios channel id " + channelId)
                            ProfileService.bindBaiduPush("ios", channelId);
                        } else if (ionic.Platform.isAndroid()) {
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
                    var backUrl = BackUrlUtil.getBackUrl();
                    if (backUrl != null) {
                        BackUrlUtil.destory();
                        $state.go(backUrl);
                        e.preventDefault();
                        return false;
                    }

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
                ProfileService.updateCustomerVersion();
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

        WxReadyService.wxConfig(function () {
            WxTokenService.getAccess_token($window.location.href).then(function (data) {
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

        $urlRouterProvider.otherwise('/main/profile')

        $stateProvider.state('welcome', {
            url: '/welcome',
            views: {
                main: {
                    templateUrl: 'welcome/welcome.html',
                    controller: 'WelcomeCtrl'
                }
            }
        }).state('main', {
            url: '/main?code&state',
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
            url: '/search?{categoryId:int}&{brandId:int}&{page:int}&sortProperty&sortDirection&backUrl&query&{parentCategoryId:int}&{mainParentCategoryId:int}',
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
            onExit: ['CartService', function (CartService) {
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
            url: '/order-detail?{id:int}&{confirmStatus:int}&backUrl',
            views: {
                main: {
                    templateUrl: 'order/order-detail.html',
                    controller: 'OrderDetailCtrl'
                }
            }
        }).state('favorite', {
            url: '/favorite',
            views: {
                main: {
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
            url: '/order-evaluate/?id&hasEvaluated',
            views: {
                main: {
                    templateUrl: 'order/order-evaluate.html',
                    controller: 'OrderEvaluateCtrl'
                }
            }
        }).state('coupon', {
            url: '/coupon',
            views: {
                main: {
                    templateUrl: 'profile/coupon.html',
                    controller: 'coupon'
                }
            }
        }).state('couponExp', {
            url: '/couponExp',
            views: {
                main: {
                    templateUrl: 'profile/couponExp.html'
                }
            }
        }).state('couponEdit', {
            url: '/couponEdit',
            views: {
                main: {
                    templateUrl: 'profile/couponEdit.html',
                    controller: 'couponEditCtrl'
                }
            }
        }).state('keyword-search', {
            url: '/keyword-search/?backUrl&queryWords',
            views: {
                main: {
                    templateUrl: 'search/search.html',
                    controller: 'SearchCtrl'
                }
            }
        }).state('add-restaurant', {
            url: '/add-restaurant',
            views: {
                main: {
                    templateUrl: 'restaurant/add-restaurant.html',
                    controller: 'AddRestaurantCtrl'
                }
            }
        }).state('invite-friends', {
            url: '/share',
            views: {
                main: {
                    templateUrl: 'share/share.html',
                    controller: 'ShareCtrl'
                }
            }
        }).state('share-page', {
            url: '/share-page?sharerId',
            views: {
                main: {
                    templateUrl: 'share/share-page.html',
                    controller: 'SharePageCtrl'
                }
            }
        }).state('map', {
            url: '/map',
            views: {
                main: {
                    templateUrl: 'map/map.html',
                    controller: 'MapCtrl'
                }
            }
        }).state('settings', {
            url: '/settings',
            views: {
                main: {
                    templateUrl: 'settings/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        }).state('modify-password', {
            url: '/modify-password',
            views: {
                main: {
                    templateUrl: 'modify-password/modify-password.html',
                    controller: 'ModifyPasswordCtrl'
                }
            }
        }).state('help-center', {
            url: '/help-center',
            views: {
                main: {
                    templateUrl: 'help-center/help-center.html',
                    controller: 'HelpCenterCtrl'
                }
            }
        }).state('help-order', {
            url: '/help-order',
            views: {
                main: {
                    templateUrl: 'help-center/help-order.html',
                    controller: 'HelpOrderCtrl'
                }
            }
        }).state('help-buying', {
            url: '/help-buying',
            views: {
                main: {
                    templateUrl: 'help-center/help-buying.html',
                    controller: 'HelpBuyCtrl'
                }
            }
        }).state('help-time', {
            url: '/help-time',
            views: {
                main: {
                    templateUrl: 'help-center/help-time.html',
                    controller: 'HelpTimeCtrl'
                }
            }
        }).state('help-range', {
            url: '/help-range',
            views: {
                main: {
                    templateUrl: 'help-center/help-range.html',
                    controller: 'HelpRangeCtrl'
                }
            }
        }).state('help-charge', {
            url: '/help-charge',
            views: {
                main: {
                    templateUrl: 'help-center/help-charge.html',
                    controller: 'HelpChargeCtrl'
                }
            }
        })
            .state('help-onlineCharge', {
                url: '/help-onlineCharge',
                views: {
                    main: {
                        templateUrl: 'help-center/help-onlineCharge.html',
                        controller: 'HelpOnlineChargeCtrl'
                    }
                }
            }).state('help-service', {
                url: '/help-service',
                views: {
                    main: {
                        templateUrl: 'help-center/help-service.html',
                        controller: 'HelpServiceCtrl'
                    }
                }
            }).state('help-change', {
                url: '/help-change',
                views: {
                    main: {
                        templateUrl: 'help-center/help-change.html',
                        controller: 'HelpChangeCtrl'
                    }
                }
            }).state('main.order-list', {
                url: '/order-list',
                views: {
                    orderList: {
                        templateUrl: 'order/order-list.html',
                        controller: 'OrderListCtrl'
                    }
                }
            }).state('seckill-product', {
                url: '/seckill-product?{activeId:int}',
                views: {
                    main: {
                        templateUrl: 'product/seckill-product.html',
                        controller: 'SeckillProductCtrl'
                    }
                }
            })
            .state('seckillProduct-detail', {
                url: '/seckillProduct-detail?{activeId:int}&{itemId:int}&backUrl',
                views: {
                    main: {
                        templateUrl: 'product/seckillProduct-detail.html',
                        controller: 'SeckillProductDetail'
                    }
                }
            }).state('membership-point', {
                url: '/membership-point',
                views: {
                    main: {
                        templateUrl: 'point/membership-point.html',
                        controller: 'MembershipPointCtrl'
                    }
                }
            }).state('redeem-point', {
                url: '/redeem-point/?restaurantName&availableScore',
                views: {
                    main: {
                        templateUrl: 'point/redeem-point.html',
                        controller: 'RedeemPointCtrl'
                    }
                }
            }).state('generate-records', {
                url: '/generate-records/?availableScore',
                views: {
                    main: {
                        templateUrl: 'point/generate-records.html',
                        controller: 'GenerateRecordCtrl'
                    }
                }
            }).state('exchange-records', {
                url: '/exchange-records/?availableScore',
                views: {
                    main: {
                        templateUrl: 'point/exchange-records.html',
                        controller: 'ExchangeRecordCtrl'
                    }
                }
            }).state('point-rule', {
                url: '/point-rule',
                views: {
                    main: {
                        templateUrl: 'point/point-rule.html'
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
        return function (scope, element) {
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
        service.cityId = null;

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
            $scope.shoopingTips = true;
        }else{
            $scope.shoopingTips = false;
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
            if(orderItem.spikeItem){
                if(orderItem.quantity>=orderItem.spikeItem.perMaxNum){
                    orderItem.quantity=orderItem.spikeItem.perMaxNum;
                }else{
                    orderItem.quantity = orderItem.quantity + 1;
                }
            }else{
                orderItem.quantity = orderItem.quantity + 1;
            }

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
                                if(orderItem.spikeItem){
                                    chosenSkuArray.push({
                                        skuId: orderItem.sku.id,
                                        quantity: orderItem.quantity,
                                        bundle:orderItem.bundle,
                                        spikeItemId:orderItem.spikeItem.id,
                                        cartSkuType:2
                                    })
                                }else{
                                    chosenSkuArray.push({
                                        skuId: orderItem.sku.id,
                                        quantity: orderItem.quantity,
                                        bundle:orderItem.bundle
                                    })
                                }
                            }
                        });

                        CartService.checkStockOut(chosenSkuArray).then(function(stockOut) {
                            if(stockOut && stockOut.length > 0) {
                                var message = "";
                                stockOut.forEach(function(v) {
                                    if(v.spikeOutInfo) {
                                        if(v.spikeOutInfo.spikeActivityState == 2){
                                            if (v.spikeOutInfo.num - v.spikeOutInfo.takeNum > 0) {
                                                if(v.spikeOutInfo.customerTakeNum < v.spikeOutInfo.perMaxNum){
                                                    if(v.spikeOutInfo.customerTakeNum+v.spikeOutInfo.currentBuyQuantity>=v.spikeOutInfo.perMaxNum){
                                                        $scope.canBuy = v.spikeOutInfo.perMaxNum - v.spikeOutInfo.customerTakeNum;

                                                        message = "秒杀商品"+v.spikeOutInfo.skuName+"您已经购买了" + v.spikeOutInfo.customerTakeNum +"件，还可以购买"+$scope.canBuy+"件";
                                                    }
                                                }else{
                                                    message = "秒杀商品: "+v.spikeOutInfo.skuName+" 您已经购买了" + v.spikeOutInfo.customerTakeNum +"件，到达活动的购买数量了" ;
                                                }

                                            } else {
                                                message = "以下商品已抢完" + "：" + v.spikeOutInfo.skuName;
                                            }
                                        }else{

                                            message= "以下活动商品已经过期" + "：" +v.spikeOutInfo.skuName;
                                        }

                                    }else{

                                        message = "以下商品缺货" + "：" +v.spikeOutInfo.skuName;
                                    }

                                });

                                AlertService.alertMsg(message);

                                stockOut.forEach(function(v) {

                                    if(v.spikeOutInfo && v.cartSkuType==2){
                                        order.orderItems.forEach(function (orderItem) {

                                            if (orderItem.sku.id == v.id && orderItem.spikeItem) {
                                                if(v.stock) {
                                                    orderItem.quantity = v.stock;
                                                    orderItem.totalPrice = orderItem.quantity * orderItem.price;
                                                } else {
                                                    orderItem.chosen = false;
                                                }
                                            }
                                        });
                                    }else{
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
                                    }

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
                            template: '<center>请选择商品</center>',
                            okText: '确定',
                            okType: 'button-light'
                        });
                    }
                } else {
                    $ionicPopup.alert({
                        template: '<center>您没有审核通过的餐馆</center>',
                        okText: '确定',
                        okType: 'button-light'
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
                            skuIds.push(item.id);
                        }
                    });
                }

                if (skuIds.length == 0) {
                    AlertService.alertMsg("请选择商品");
                } else {

                    $ionicPopup.confirm({
                        template: '<center>确定删除商品？</center>',
                        cancelText: '取消',
                        cancelType: 'button-default',
                        okText: '确定',
                        okType: 'button-assertive'
                    }).then(function (res) {
                        if (res) {
                            if ($scope.cart.orderItems.length > 0) {
                                $scope.cart.orderItems.forEach(function (item) {
                                    if (item.chosen) {
                                        skuIds.push(item.id);
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
        $scope.productDetail = function(skuId,spikeItem){
            $scope.burl =  $location.url()
            if(spikeItem){
                $state.go("seckillProduct-detail", {activeId:spikeItem.spikeId,itemId:spikeItem.id,backUrl: $scope.burl});
            }else{
                $state.go("product-detail",{id:skuId,backUrl: $scope.burl});
            }

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
                        quantity: orderItem.quantity,
                        bundle:orderItem.bundle
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
                params: {itemIds:array}
            }).then(function (payload) {
                service.cart = payload.data;
                return payload.data;
            }, function (error) {
                $state.go("login");
            })
        };
        //contentType: "application/json;charset=utf-8"


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
    .controller('ConfirmCtrl', function ($scope, $state, $stateParams, $rootScope, $filter, $ionicPopup, $location, ProfileService, DeviceUtil, CartService, OrderService, Analytics, AlertService) {
        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });

        ProfileService.getRestaurants().then(function (data) {
            $scope.myRestaurant = data[0];
        });

        $scope.currentUrl = $location.url();

        $scope.chosenItem = [];
        $scope.previewOrder = function () {
            var array = [];
            $scope.chosenItem = CartService.getChosenItem();
            $scope.chosenItem.forEach(function (orderItem) {
                if (orderItem.spikeItem) {
                    array.push({
                        skuId: orderItem.sku.id,
                        quantity: orderItem.quantity,
                        bundle: orderItem.bundle,
                        spikeItemId: orderItem.spikeItem.id,
                        cartSkuType: 2
                    })
                } else {
                    array.push({
                        skuId: orderItem.sku.id,
                        quantity: orderItem.quantity,
                        bundle: orderItem.bundle
                    })
                }

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

                $scope.chosenItem.forEach(function (orderItem) {
                    if (orderItem.spikeItem) {
                        arr.push({
                            skuId: orderItem.sku.id,
                            quantity: orderItem.quantity,
                            bundle: orderItem.bundle,
                            spikeItemId: orderItem.spikeItem.id,
                            cartSkuType: 2
                        })
                    } else {
                        arr.push({
                            skuId: orderItem.sku.id,
                            quantity: orderItem.quantity,
                            bundle: orderItem.bundle
                        })
                    }
                })
                $scope.cId = $stateParams.cId;

                ProfileService.couponEdit(arr).then(function (data) {
                    $scope.coupons = data.data;
                    //console.log($scope.coupons)
                    //alert(JSON.stringify($scope.coupons));
                    // console.log(data);
                    ProfileService.setCouponInfo($scope.coupons);

                    if ($scope.cId) {
                        $scope.hasPromotion = false;
                        $scope.coupons.forEach(function (couponItem) {
                            if (couponItem.id == $scope.cId) {
                                $scope.thisCoupon = couponItem;
                                //alert(JSON.stringify($scope.thisCoupon));

                                $scope.total = $scope.total - $scope.thisCoupon.coupon.discount;
                                if ($scope.total < 0) {
                                    $scope.total = 0;
                                }
                                couponItem.chosen = true;
                                // console.log($scope.total);
                                // console.log($scope.thisCoupon.coupon.discount);
                            }
                        })
                    } else {
                        $scope.hasPromotion = true;
                    }
                });
            });
        };

        $scope.previewOrder();

        $scope.submitOrder = function (cart) {
            var submitOrderConfirm = $ionicPopup.confirm({
                template: '<center>是否确认订单？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            submitOrderConfirm.then(function (res) {
                if (res) {
                    var form = [];
                    $scope.chosenItem = CartService.getChosenItem();
                    $scope.chosenItem.forEach(function (orderItem) {
                        if (orderItem.spikeItem) {
                            form.push({
                                skuId: orderItem.sku.id,
                                quantity: orderItem.quantity,
                                bundle: orderItem.bundle,
                                spikeItemId: orderItem.spikeItem.id,
                                cartSkuType: 2
                            })
                        } else {
                            form.push({
                                skuId: orderItem.sku.id,
                                quantity: orderItem.quantity,
                                bundle: orderItem.bundle
                            })
                        }

                    })

                    var deviceId = DeviceUtil.deviceId;
                    if ($stateParams.cId) {
                        var data = {
                            skuarray: form,
                            couponId: $stateParams.cId,
                            deviceId: deviceId
                        }
                    } else {
                        var data = {
                            skuarray: form,
                            couponId: null,
                            deviceId: deviceId
                        }
                    }

                    OrderService.submitOrder(data).then(function (orders) {
                        CartService.resetCart();
                        CartService.getCart();

                        ProfileService.getProfile().then(function () {
                            Analytics.trackEvent('cart', 'click', 'submitOrder');
                        })

                        if (orders.length == 1) {
                            $state.go("order-detail", {id: orders[0].id, confirmStatus: 1});
                        } else {
                            $state.go("order-list");
                        }
                    }, function (data) {
                        if(data.stockOut && data.stockOut>0){
                            var msg = "";
                            data.stockOut.forEach(function(dataItem){
                                if(dataItem.outOfInfo.spikeActivityState==2){
                                    var leftoverNum = dataItem.outOfInfo.num-dataItem.outOfInfo.takeNum;
                                    if(leftoverNum>0){
                                        if(dataItem.outOfInfo.customerTakeNum<dataItem.outOfInfo.perMaxNum){
                                            if(dataItem.outOfInfo.customerTakeNum+dataItem.outOfInfo.currentBuyQuantity>=dataItem.outOfInfo.perMaxNum){
                                                $scope.canBuy = dataItem.outOfInfo.perMaxNum - dataItem.outOfInfo.customerTakeNum;

                                                message = "秒杀商品"+vdataItem.outOfInfo.skuName+"您已经购买了" + dataItem.outOfInfo.customerTakeNum +"件，还可以购买"+$scope.canBuy+"件";
                                            }

                                        }else{
                                            msg+=dataItem.outOfInfo.skuName+"已经买够了活动限购数量";
                                        }
                                    }else{
                                        msg+=dataItem.outOfInfo.skuName+"已经抢光了！";


                                    }

                                }else{
                                    msg=dataItem.outOfInfo.skuName+"抢购结束";

                                }
                            })
                            AlertService.alertMsg(msg);
                        }else{
                            AlertService.alertMsg(data.errmsg);
                        }


                    });
                } else {
                    return;
                }
            });
        }

        $scope.gotoCouponEdit = function () {
            if ($scope.coupons && $scope.coupons.length > 0) {
                $state.go('couponEdit');
            }
        }

        //商品详情页
        $scope.productDetail = function (skuId, spikeItem) {
            $scope.burl = $location.url()
            if (spikeItem) {
                $state.go("seckillProduct-detail", {
                    activeId: spikeItem.spikeId,
                    itemId: spikeItem.id,
                    backUrl: $scope.burl
                });
            } else {
                $state.go("product-detail", {id: skuId, backUrl: $scope.burl});
            }

        }

    })
angular.module('cgwy')
    .controller('FavoriteCtrl', function ($scope, $rootScope, $ionicPopup, $location, $state, $stateParams, ProductService, ProfileService, CartService, FavoriteService, AlertService, Analytics) {

        $scope.showLoading = true;

        $scope.favorites = $rootScope.favorites ? $rootScope.favorites : [];

        $scope.getFavorites = function () {
            FavoriteService.getFavorites().then(function (favorites) {

                $scope.favorites = favorites;
                $scope.favorites.forEach(function(favoriteItem){
                    /*单选打包，单选*/
                    favoriteItem.bundleName = "bundleName";
                    favoriteItem.singleName = "singleName";

                    favoriteItem.checkboxModel = {
                        bundle : true,
                        single : false
                    };
                    if(favoriteItem.bundleCount == 0 && favoriteItem.singleCount==0){
                        favoriteItem.checkboxModel.bundle = true;
                    } else if(favoriteItem.bundleCount>0 && favoriteItem.singleCount>=0 ){
                        favoriteItem.checkboxModel.bundle = true;
                    } else if(favoriteItem.bundleCount==0 && favoriteItem.singleCount>0){
                        favoriteItem.checkboxModel.bundle = false;
                        favoriteItem.checkboxModel.single = true;
                    }
                })



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

                $scope.showLoading = false;
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
                        array.push({skuId: f.sku.id, quantity: f.rebuyQuantity,bundle:f.checkboxModel.bundle});
                    }
                })
            }

            array.reverse();

            if (array.length == 0) {
                AlertService.alertMsg("请选择商品");
            } else {
                CartService.addSkuIntoCart(array).then(function () {
                    $state.go("cart", {backUrl: "/favorite"});

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
                    template: '<center>确定删除收藏？</center>',
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
                            $state.go('favorite');
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
        $scope.oneChange = function (id, name,bundle,single) {
            $scope.favorites.forEach(function(favoriteItem){
                favoriteItem.seletedId = id;
                if(favoriteItem.seletedId == favoriteItem.id){
                    if (name == "bundleName") {
                        if (bundle == true) {
                            favoriteItem.checkboxModel.bundle = true;
                            favoriteItem.checkboxModel.single = false;
                        } else {
                            favoriteItem.checkboxModel.bundle = false;
                            favoriteItem.checkboxModel.single = true;
                        }
                    } else if (name == "singleName") {
                        if (single == true) {
                            favoriteItem.checkboxModel.single = true;
                            favoriteItem.checkboxModel.bundle = false;
                        } else {
                            favoriteItem.checkboxModel.single = false;
                            favoriteItem.checkboxModel.bundle = true;
                        }
                    }
                }
            })
        }


        $scope.backUrl =  "/favorite";
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
    .controller('FeedbackCtrl', function ($scope, $state, $ionicActionSheet, $ionicBackdrop , CameraService, FeedbackService, AlertService) {

        $scope.form = {};

        $scope.isCommitState = true;

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
                    $scope.isCommitState = true;

                    CameraService.upload(filePath).then(function (file) {
                        console.log("upload feedback success");

                        $scope.showLoading = false;
                        $ionicBackdrop.release();
                        $scope.isCommitState = false;

                        FeedbackService.feedback($scope.form.content, file.id).then(function () {
                            AlertService.alertMsg("反馈成功，我们会尽快处理").then(function() {
                                $state.go("main.profile")
                            });
                        });

                    }, function (err) {
                        console.log(err);

                        $scope.showLoading = false;
                        $ionicBackdrop.release();
                        $scope.isCommitState = false;

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

        $scope.$watch('lastPhoto', function(newValue) {
            if (newValue) {
                $scope.isCommitState = false;
            } else if (newValue === "" || newValue === null) {
                $scope.isCommitState = true;
            }
        });

        $scope.$watch('form.content', function(newValue) {
            if (newValue) {
                $scope.isCommitState = false;
            } else if (newValue === "" || newValue === null) {
                $scope.isCommitState = true;
            }
        });
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
    .controller('ForgetPasswordCtrl', function ($scope, $state, $interval, ProfileService, AlertService) {
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
    .controller('HelpBuyCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });

/**
 * Created by jiangronghua on 15/9/22.
 */
angular.module('cgwy')
    .controller('HelpCenterCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
/**
 * Created by jiangronghua on 15/9/23.
 */
/**
 * Created by jiangronghua on 15/9/23.
 */
angular.module('cgwy')
    .controller('HelpChangeCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });

/**
 * Created by jiangronghua on 15/9/23.
 */
angular.module('cgwy')
    .controller('HelpChargeCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
angular.module('cgwy')
    .controller('HelpOnlineChargeCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
/**
 * Created by jiangronghua on 15/9/22.
 */
angular.module('cgwy')
    .controller('HelpOrderCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
/**
 * Created by jiangronghua on 15/9/23.
 */
angular.module('cgwy')
    .controller('HelpRangeCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
/**
 * Created by jiangronghua on 15/9/23.
 */
/**
 * Created by jiangronghua on 15/9/23.
 */
angular.module('cgwy')
    .controller('HelpServiceCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
/**
 * Created by jiangronghua on 15/9/23.
 */
angular.module('cgwy')
    .controller('HelpTimeCtrl', function ($scope, $ionicPopup, ProfileService, Analytics) {


    });
angular.module('cgwy')
    .controller('HomeCtrl', function ($scope, $ionicPopup, $stateParams, $ionicSlideBoxDelegate, $state, $ionicPopover, UpdateService, OrderService, ProfileService, ActivityService, Analytics, AlertService, LocationService, CartService, $rootScope, DeviceUtil, ProductService) {
        function showBanner() {
            if (ActivityService.banners && ActivityService.banners.length > 0) {
                $scope.banners = ActivityService.banners;
                $ionicSlideBoxDelegate.update();
            }

            if (ProfileService.isDisplayWelcome()) {
                if (ActivityService.welcomeContent) {
                    var alertPopup = $ionicPopup.alert({
                        template: "<div class='push'>" + ActivityService.welcomeContent.welcomeTitle + "</div><br><div class='push-body'>" + ActivityService.welcomeContent.welcomeMessage + "</div>",
                        okText: '我知道了',
                        okType: 'button-light'
                    });

                    ProfileService.setDisplayWelcome(false);
                } else {
                    ActivityService.reloadActivities().then(function (d) {
                        if (ActivityService.welcomeContent) {
                            var alertPopup = $ionicPopup.alert({
                                template: "<div class='push'>" + ActivityService.welcomeContent.welcomeTitle + "</div><br><div class='push-body'>" + ActivityService.welcomeContent.welcomeMessage + "</div>",
                                okText: '我知道了',
                                okType: 'button-light'
                            });

                            ProfileService.setDisplayWelcome(false);
                        }
                    });
                }
            }


        }

        $scope.isNullTodayOrders = true;

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (profile) {
                if ($rootScope.wxcode) {
                    ProfileService.bindWxCode($rootScope.wxcode);
                }

                ProfileService.getCustomerCityId().then(function (cityId) {
                    $scope.currentLoginCityId = cityId;

                    switch (cityId) {
                        case 1:
                            $scope.currentCity = "北京";
                            break;
                        case 2:
                            $scope.currentCity = "成都";
                            break;
                        case 3:
                            $scope.currentCity = "杭州";
                            break;
                        case 4:
                            $scope.currentCity = "济南";
                            break;
                        default:
                            $scope.currentCity = "北京";
                    }

                    try{
                        window.plugins.jPushPlugin.setTags([$scope.currentCity]); //设置推送tag
                    }catch(e){
                        console.log("JPush plugin is undefined -- setTags");
                    }

					LocationService.chooseCity(cityId, $scope.currentCity);
                    loadActivity(); //根据城市ID加载活动
                });

                OrderService.getTodayOrders().then(function (orders) {
                    $scope.todayOrders = orders;

                    if (orders && orders.length > 0) {
                        $scope.isNullTodayOrders = false;
                    } else {
                        $scope.isNullTodayOrders = true;
                    }
                })
            } else {
                //如果登录则取用户注册城市,否则定位城市
                LocationService.locationCity().then(function (CityMessage) {
                    $scope.currentCity = CityMessage.city;
                    loadActivity(); //根据定位城市ID查询活动
                }, function (err) {
                    $scope.currentCity = "北京";
                    LocationService.chooseCity(1, $scope.currentCity);
                });
            }
        })

        // 客服热线 Customer Service Hotline
        $scope.CSH = "400-898-1100"; // 北京客服
        $scope.dial = function () {
            window.open('tel:' + sessionStorage['CSH'], '_system');
        }

        $scope.contact = function (truckerTel) {
            var contactConfirm = $ionicPopup.confirm({
                template: '<center style="margin-left: -12px;margin-right: -12px;">确定要拨打您此单的司机电话？<div style="color: red;margin-bottom: -10px;">' + truckerTel + '</div></center>',
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

        //判断是否是登陆了，登陆了不显示首页已经开通的城市
        ProfileService.getProfile().then(function (profile) {
            if (!profile) {
                $scope.showDown = false;
                $ionicPopover.fromTemplateUrl('templates/citySelectPopover.html', {
                    scope: $scope
                }).then(function (popover) {
                    $scope.citySelectPopover = popover;
                });
            } else {
                $scope.showDown = true;
            }

        });

        LocationService.getCities().then(function (cities) {
            $scope.openCities = cities;
        });


        function loadActivity() {
            var cityId = LocationService.getChosenCity().id;
            //alert(ActivityService.welcomeContent);
            if (cityId == ActivityService.cityId) {
                if (ActivityService.banners && ActivityService.banners.length > 0) {
                    showBanner();
                }
            } else {
                ActivityService.reloadActivitiesByCityId(cityId).then(function () {
                    ActivityService.cityId = cityId;
                    showBanner();
                })
            }
        }

        $scope.currentCityClick = function () {
            $scope.citySelectPopover.hide();
        };

        $scope.citySelected = function (openCityId) {
            $scope.citySelectPopover.hide();

            for (var i = 0; i < $scope.openCities.length; i++) {
                if ($scope.openCities[i].id === openCityId) {
                    $scope.currentCity = $scope.openCities[i].name;
                    LocationService.chooseCity($scope.openCities[i].id, $scope.openCities[i].name);
                }
            }
        };

        $scope.orderAgain = function (order) {
            if (order.orderItems) {
                var array = [];
                order.orderItems.forEach(function (orderItem) {
                    array.push({skuId: orderItem.sku.id, quantity: orderItem.quantity});
                });

                CartService.addSkuIntoCart(array).then(function () {
                    $state.go('cart', {backUrl: '/main/home'});
                });
            }
        };

        var deviceId = DeviceUtil.deviceId;
        $scope.orderCancel = function (orderId) {
            var orderCancelConfirm = $ionicPopup.confirm({
                template: '<center>确定取消该订单？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            orderCancelConfirm.then(function (res) {
                if (res) {
                    OrderService.cancelOrder({orderId: orderId, deviceId: deviceId}).then(function (data) {
                        OrderService.getTodayOrders().then(function (orders) {
                            $scope.todayOrders = orders;

                            if (orders && orders.length > 0) {
                                $scope.isNullTodayOrders = false;
                            } else {
                                $scope.isNullTodayOrders = true;
                            }
                        });
                    });
                } else {
                    return;
                }
            });
        };


        /*秒杀活动*/
        var timer; //定时器
        var productShow; //用来判断是否可以点击显示秒杀活动商品
        var span = document.getElementById("timeSpan");

        $scope.activeCityId = LocationService.getChosenCity().id;
        ProductService.miaoSha($scope.activeCityId).then(function (data) {
            $scope.miaoShaData = data;

            if (data.length > 0 && data[0].state == 1) {

                var localTime = new Date();
                $scope.timeNum = data[0].beginTime - localTime.getTime();
                $scope.timeSum = data[0].endTime - localTime.getTime()


                if ($scope.timeNum > 0 && $scope.timeNum <= 7200000) {
                    //活动开始前

                    //获取活动开始的时间和结束的时间
                    var begin = new Date(data[0].beginTime);
                    var end = new Date(data[0].endTime);

                    $scope.beginH = begin.getHours();
                    $scope.beginM = begin.getMinutes();

                    $scope.endH = end.getHours();
                    $scope.endM = end.getMinutes();
                    $scope.time =  $scope.addZero($scope.beginH )+ ":" +$scope.addZero($scope.beginM )  + "-" + $scope.addZero($scope.endH) + ":" +  $scope.addZero($scope.endM);

                    $scope.showStatus = true;
                    productShow = $scope.timeStatus = false;

                } else if ($scope.timeNum < 0 && $scope.timeSum > 0) {

                    productShow = $scope.showStatus = true;

                    //活动开始
                    timer = window.setInterval(function () {
                        var nowTime = new Date();
                        span.innerHTML = $scope.qiangGou(nowTime, data[0].endTime);
                    }, 1000);

                } else if ($scope.timeSum < 0) {
                     window.clearInterval(timer);
                    timer = null;
                    $scope.showStatus = false;
                    productShow = false;
                }

            } else {
                productShow = false;
                $scope.showStatus = false;
            }
        })


        $scope.qiangGou = function (nowTime, targetTime) {
            var str;
            var spanTime = targetTime - nowTime.getTime();//总毫秒差
            if (spanTime > 0) {
                timeShow = $scope.timeStatus = true;
                $scope.spanHour = $scope.addZero(Math.floor(spanTime / (1000 * 60 * 60)));//总毫秒中包含多少个小时
                $scope.hourMs = $scope.spanHour * 60 * 60 * 1000;//hour所占毫秒

                $scope.spanMinu = $scope.addZero(Math.floor((spanTime - $scope.hourMs) / (1000 * 60)));//总毫秒中包含多少个分钟
                $scope.minuMs = $scope.spanMinu * 60 * 1000;//minute所占的毫秒

                $scope.spanSeco = $scope.addZero(Math.floor((spanTime - $scope.hourMs - $scope.minuMs) / 1000));//总毫秒中包含多少个秒
                str = "<div class='timeStyle'>" + $scope.spanHour + "</div>" + ":" + "<div class='timeStyle'>" + $scope.spanMinu + "</div>" + ":" + "<div class='timeStyle'>" + $scope.spanSeco + "</div>";
            } else {
                timeShow = $scope.timeStatus = false;
                str = "";
            }
            return str;
        }


        //判断时间是不是小于10，小则添0
        $scope.addZero = function (num) {
            return num = num > 9 ? num : "0" + num;
        }

        $scope.showActiveProduct = function () {
            if (productShow == true) {
                $state.go('seckill-product', {activeId: $scope.miaoShaData[0].id});
            } else {
                return;
            }
        }


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

        //根据定位获取城市
        var that = this;
        this.locationCity = function () {
            return this.getCurrentCity().then(function (currentCity) {
                var cityMessage = {};
                if (currentCity.data.status === 0) {
                    var location_city_code = currentCity.data.content.address_detail.city_code;
                    var currentCity, currentCityId;

                    if (location_city_code === 131) {
                        currentCity = "北京";
                        currentCityId = 1;
                    } else if (location_city_code === 75 || location_city_code === 32) {
                        currentCity = "成都";
                        currentCityId = 2;
                        var CSH = "028-8774-8154"; // 成都客服
                    } else if (location_city_code === 29 || location_city_code === 179) {
                        currentCity = "杭州";
                        currentCityId = 3;
                    } else if (location_city_code === 8 || location_city_code === 288) {
                        currentCity = "济南";
                        currentCityId = 4;
                    } /*else if (location_city_code === 18 || location_city_code === 315) {
                        currentCity = "南京";
                        currentCityId = 5;
                    }*/
                    else {
                        currentCity = "北京";
                        currentCityId = 1;
                    }
                    //location_city_code === 9 || location_city_code === 53 //吉林省或者长春
                    //$scope.currentCity = currentCity;
                    that.chooseCity(currentCityId, currentCity);
                    return cityMessage = {cityId: currentCityId, city: currentCity}

                }
            })
        }

        this.getCurrentCity = function () {
            return $http.jsonp("http://api.map.baidu.com/location/ip?ak=1507703fda1fb9594c7e7199da8c41d8&coor=bd09ll&callback=JSON_CALLBACK")
                .success(function (data) {
                    return data;
                });
        };

        this.chooseCity = function (cityId, cityName) {
            window.localStorage.setItem("currentCity", JSON.stringify({"id": cityId, "name": cityName}));
        }

        this.getChosenCity = function () {
            return window.localStorage.getItem("currentCity") ? JSON.parse(window.localStorage.getItem("currentCity")) : null;
        }

        this.getCustomerCityId = function () {
            return ProfileService.getProfile().then(function (profile) {
                var cityId = 1;

                if (profile) {
                    if (profile.block) {
                        cityId = profile.block.city.id;
                    } else if (profile.zone) {
                        cityId = profile.zone.warehouse.city.id;
                    }
                }

                return cityId;
            })
        }
    });

angular.module('cgwy')
    .controller('MainCtrl', function ($scope, $state, $stateParams, $rootScope) {
        if($stateParams.code) {
            $rootScope.wxcode = $stateParams.code;

        }
    });

angular.module('cgwy')
    .controller('MapCtrl', function ($scope, $stateParams, $state, MapService,$ionicHistory) {
        $scope.near = false;
        $scope.locaitonClass = "tab-item active";
        $scope.nearClass = "tab-item";
		$scope.locationFontcolor = "color:#CA3A3A;";
		$scope.nearFontcolor = "";

        $scope.goBackView = function(){
			$ionicHistory.goBack();
    	}
    	
    	var reloadGeo = true;
 		var map = new BMap.Map("allmap");
 		if(MapService.isUsePointByCache()){
			map.centerAndZoom(MapService.getPoint(), 17);  //创建中心点,放大等级
 			map.setCenter(MapService.getPoint());
			initSearch();
 		}else{
 			var cityName = MapService.getViewModel().cityName == undefined ? "北京" : MapService.getViewModel().cityName;
	 		map.centerAndZoom(cityName, 15); //根据城市名称定位 
	 		initSearch();		
	 		map.addEventListener("tilesloaded",function(){
				//在地图页面只重新定位一次
				if(reloadGeo){
					reloadGeo = false;
	 			MapService.geolocation(geoCallback);
				function geoCallback(){
					if(MapService.getPointState() == 1){
						map.centerAndZoom(MapService.getPoint(), 17); 
						map.setCenter(MapService.getPoint());
						initSearch();
					}
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

        //tab点击事件
        $scope.clickTab = function(isNear){
            $scope.near = isNear;
            $scope.locaitonClass = isNear ? "tab-item" : "tab-item active";
			$scope.locationFontcolor = isNear ? "" : "color:#CA3A3A;";
            $scope.nearClass = isNear ? "tab-item active" : "tab-item";
			$scope.nearFontcolor = isNear ? "color:#CA3A3A;" : "";
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
            $ionicHistory.goBack();
        }
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
					//service定位不提示Alert
					if(callback != null)
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
				template: "<div class='push'>位置服务</div><br><div class='push-body'>" + msg + "</div>",
				okText: '确定',
				okType: 'button-light'
			});
		};
		  
    return service;
});

angular.module('cgwy')
    .controller('ModifyPasswordCtrl', function ($scope, $state, ProfileService, AlertService, Analytics, WxReadyService, CartService, BackUrlUtil) {

        // 用户密码信息
        $scope.user = {
            username: '',
            password: '',
            newPassword: '',
            repeatPassword: ''
        };

        // 获取当前用户账户
        if (window.localStorage['cachedUsername']) {
            $scope.user.username = window.localStorage['cachedUsername'];
        } else {
            ProfileService.getProfile().then(function (profile) {
                $scope.user.username = profile.username;
            });
        }

    	$scope.modifyPassword = function (user) {

            if (user.password.length < 6 || user.password.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号原密码");
                return;
            }
            if (user.newPassword.length < 6 || user.newPassword.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号新密码");
                return;
            }
            if (user.repeatPassword.length < 6 || user.repeatPassword.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号确认密码");
                return;
            }
            if (user.newPassword != user.repeatPassword) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }

            ProfileService.modifyPassword($scope.user.username,$scope.user.password, $scope.user.newPassword).then(function (res) {
                var msg = "";
                switch (res){
                    case 1:
                        msg = "密码修改成功";
                        break;
                    case 2:
                        msg = "密码修改失败";
                        break;
                    case 3:
                        msg = "原密码错误";
                        break;
                    default :
                        msg = "密码修改失败";
                }


                //修改成功 , 登出
                AlertService.alertMsg(msg).then(function () {
                    if(res == 1) {
                        Analytics.trackEvent('profile', 'logout');
                        ProfileService.logout().then(function() {
                            BackUrlUtil.setBackUrl("main.home"); //设置后退路径
                            CartService.resetCart();
                            $scope.profile = null;
                            WxReadyService.wxOnMenuShare();
                            $state.go("login");
                        });
                    }
                });

            });
        };
    });
angular.module('cgwy')
    .controller('OrderDetailCtrl', function ($window,$ionicHistory,$scope, $ionicPopup, ProfileService, OrderService, CartService, $stateParams, $state, $location, BackUrlUtil,DeviceUtil) {

        $scope.backUrl = $stateParams.backUrl ? $stateParams.backUrl : 'main.order-list';
        BackUrlUtil.setBackUrl($scope.backUrl);

        $scope.back = function(){
            BackUrlUtil.destory();
            $state.go($scope.backUrl);
        }

        $scope.currentUrl = $location.url();

        if($stateParams.confirmStatus &&$stateParams.confirmStatus==1){
            $scope.confirmStatus = $stateParams.confirmStatus;
        }


        OrderService.getOrder($stateParams.id).then(function (order) {
            $scope.order = order;

            /**
             * 微信浏览器打开情况 下,物理键返回处理
             * */
            if(window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger'){
                var urlLocation = $window.location.href;
                $window.history.pushState(null,null,$window.location.href + "#virtual");
                $window.onhashchange = function(){
                    if($window.location.href == urlLocation){
                        $window.onhashchange = null;
                        $state.go($scope.backUrl);
                    }
                }
            }
        });

        var deviceId = DeviceUtil.deviceId;
        $scope.orderCancel = function() {
            var orderCancelConfirm = $ionicPopup.confirm({
               template: '<center>确定取消该订单？</center>',
               cancelText: '取消',
               cancelType: 'button-default',
               okText: '确定',
               okType: 'button-assertive'
            });
            orderCancelConfirm.then(function(res) {
               if(res) {
                   OrderService.cancelOrder({orderId:$stateParams.id,deviceId:deviceId}).then(function(data) {
                       $scope.order = data;
                   });
               } else {
                    return;
               }
             });
        };

        /*$scope.orderAgain = function(order) {
            if(order.orderItems) {
                var array = [];
                order.orderItems.forEach(function(orderItem) {
                    array.push({skuId: orderItem.sku.id, quantity: orderItem.quantity,bundle:orderItem.bundle});
                });

                CartService.addSkuIntoCart(array).then(function() {
                    $state.go('cart',{backUrl: '/main/order-list'});
                });
            }
        };*/
        $scope.orderAgain = function(order) {
            if(order.orderItems) {
                    var array = [];
                    order.orderItems.forEach(function(orderItem) {
                        if(orderItem.sku.status.name == "生效"){
                            array.push({skuId: orderItem.sku.id, quantity: orderItem.quantity,bundle:orderItem.bundle});
                        }
                    });

                    if(array.length==order.orderItems.length){
                        CartService.addSkuIntoCart(array).then(function() {
                            $state.go('cart',{backUrl: '/main/order-list'});
                        })
                    }else if(array.length!=0 && array.length<order.orderItems.length){
                        var contactConfirm = $ionicPopup.confirm({
                            template: '<center style="margin-left: -12px;margin-right: -12px;">订单列表中部分商品已更新，如有需求请到商品列表添加!</center>',
                            okText: '再来一单',
                            okType: 'button-assertive',
                            cancelText: '取消',
                            cancelType: 'button-default'
                        });
                        contactConfirm.then(function (res) {
                            if(res){
                                CartService.addSkuIntoCart(array).then(function() {
                                    $state.go('cart',{backUrl: '/main/order-list'});
                                })
                            }else{
                                return;
                            }

                        });

                    }else if(array.length == 0){
                        var contactConfirm = $ionicPopup.confirm({
                            template: '<center style="margin-left: -12px;margin-right: -12px;">订单列表中商品已全部更新，如有需求请到商品列表添加！</center>',
                            okText: '去分类页',
                            okType: 'button-assertive',
                            cancelText: '取消',
                            cancelType: 'button-default'
                        });
                        contactConfirm.then(function (res) {
                            if(res){
                                $state.go('main.category');
                            }else{
                                return;
                            }

                        });
                    }
                }

        };

        $scope.contact = function (truckerTel) {
            var contactConfirm = $ionicPopup.confirm({
                template: '<center style="margin-left: -12px;margin-right: -12px;">确定拨打此单的司机电话？<div style="color: red;margin-bottom: -10px;">' + truckerTel + '</div></center>',
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

        $scope.hasEvaluated = false;

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

        if ($stateParams.id && $stateParams.hasEvaluated == "true") {
            $scope.hasEvaluated = true;

            OrderService.getOrderEvaluation($stateParams.id).then(function (data) {
                // console.log(data);

                $scope.data.productCount = data.productQualityScore/2;
                $scope.data.deliveryCount = data.deliverySpeedScore/2;
                $scope.data.trackerCount = data.trackerServiceScore/2;

                $scope.OrderEvaluateForm.msg = data.msg;
            });
        }

        $scope.submitOrderEvaluation = function() {
          
            if($scope.OrderEvaluateForm.productQualityScore == 0 
                || $scope.OrderEvaluateForm.deliverySpeedScore == 0
                  || $scope.OrderEvaluateForm.trackerServiceScore == 0) {
                AlertService.alertMsg("请完成所有打分才能提交");
                return;
            }

            OrderService.submitOrderEvaluation($stateParams.id,$scope.OrderEvaluateForm).then(function (){
                var alertTemplate = $ionicPopup.alert({
                        template: '<center>评价成功</center>',
                        okText: '确定',
                        okType: 'button-light'
                    });
                alertTemplate.then(function () {
                    $state.go('main.order-list');
                })
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
    .controller('OrderListCtrl', function ($scope, $state, $ionicScrollDelegate, $filter, $ionicPopup, ProfileService, OrderService, Analytics, CartService,DeviceUtil) {
        
        $scope.ordersDisplayed = [];
        $scope.showLoading = true;
        $scope.moreDataCanBeLoaded = true;
        $scope.page = 0;
        $scope.pageSize = 15;

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("main.profile");
            } else {
                OrderService.getOrders({page:$scope.page,pageSize:$scope.pageSize}).then(function (data) {
                    $scope.ordersDisplayed = data.orders;
                    $scope.showLoading = false;

                    if ($scope.ordersDisplayed && $scope.ordersDisplayed.length > 0)
                        $scope.hasOrders = true;
                    else
                        $scope.hasOrders = false;
               });
            }
        });

        $scope.loadMore = function () {
            $scope.page++;


            OrderService.getOrders({page:$scope.page,pageSize:$scope.pageSize}).then(function (data) {
                if (data.orders.length > 0) {
                    data.orders.forEach(function (order) {
                        $scope.ordersDisplayed.push(order);
                    });
                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
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
                template: '<center style="margin-left: -12px;margin-right: -12px;">确定要拨打您此单的司机电话？<div style="color: red;margin-bottom: -10px;">' + truckerTel + '</div></center>',
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

        var deviceId = DeviceUtil.deviceId;
        $scope.orderCancel = function(order) {
            var orderCancelConfirm = $ionicPopup.confirm({
               template: '<center>确定取消该订单？</center>',
               cancelText: '取消',
               cancelType: 'button-default',
               okText: '确定',
               okType: 'button-assertive'
            });
            orderCancelConfirm.then(function(res) {
               if(res) {
                   OrderService.cancelOrder({orderId:order.id,deviceId:deviceId}).then(function(data) {
                       order.status = data.status;
                   });
               } else {
                    return;
               }
             });
        };

        $scope.orderAgain = function(orderId) {
            OrderService.getOrder(orderId).then(function (order) {
                if(order.orderItems) {
                    var array = [];
                    order.orderItems.forEach(function(orderItem) {
                        if(orderItem.sku.status.name == "生效"){
                            array.push({skuId: orderItem.sku.id, quantity: orderItem.quantity,bundle:orderItem.bundle});
                        }
                     });
                    if(array.length==order.orderItems.length){
                        CartService.addSkuIntoCart(array).then(function() {
                            $state.go('cart',{backUrl: '/main/order-list'});
                        })
                    }else if(array.length!=0 && array.length<order.orderItems.length){
                        var contactConfirm = $ionicPopup.confirm({
                            template: '<center style="margin-left: -12px;margin-right: -12px;">订单中部分商品已更新，如有需求请到商品列表添加!</center>',
                            okText: '再来一单',
                            okType: 'button-assertive',
                            cancelText: '取消',
                            cancelType: 'button-default'
                        });
                        contactConfirm.then(function (res) {
                            if(res){
                                CartService.addSkuIntoCart(array).then(function() {
                                    $state.go('cart',{backUrl: '/main/order-list'});
                                })
                            }else{
                                return;
                            }

                        });

                    }else if(array.length == 0){
                        var contactConfirm = $ionicPopup.confirm({
                            template: '<center style="margin-left: -12px;margin-right: -12px;">订单中全部商品已更新，如有需求请到商品列表添加！</center>',
                            okText: '去分类页',
                            okType: 'button-assertive',
                            cancelText: '取消',
                            cancelType: 'button-default'
                        });
                        contactConfirm.then(function (res) {
                            if(res){
                                $state.go('main.category');
                            }else{
                                return;
                            }

                        });
                    }
                }
            });
        };
    })

angular.module('cgwy')
    .factory('OrderService', function ($http, $q, apiConfig, $state, $rootScope) {

        var service = {};

        //记录返回页面,提供给物理返回键
        service.setBackURL = function (backURL) {
            service.backURL = backURL;
        }
        service.getBackURL = function () {
            return service.backURL;
        }


        service.getTodayOrders = function () {
            return $http({
                url: apiConfig.host + "/api/v2/today-order",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.getOrders = function (object) {
            return $http({
                url: apiConfig.host + "/api/v2/order",
                method: 'GET',
                params: {page: object.page,pageSize:object.pageSize}
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

        service.cancelOrder = function (object) {
            var url = apiConfig.host + "/api/v2/order/" + object.orderId;
            if (object.deviceId) {
                url = url + "?"+"deviceId="+object.deviceId;
            }
            return $http({
                url: url,
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
                    couponId: orderInfo.couponId,
                    deviceId: orderInfo.deviceId,
                    bundle:orderInfo.bundle
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

        service.getOrderEvaluation = function (orderId) {
            return $http({
                url: apiConfig.host + "/api/v2/order/evaluate/" + orderId,
                method: "GET"
            }).then(function (data) {
                return data.data;
            })
        }

        return service;
    })


angular.module('cgwy')
    .controller('ExchangeRecordCtrl', function ($scope, $stateParams, $ionicPopup, $state, AlertService, MembershipPointService) {

    	if ($stateParams.availableScore)
    		$scope.availableScore = $stateParams.availableScore;

    	$scope.page = 0;
    	$scope.exchangeScoreLogs = [];
    	$scope.showLoading = true;
    	$scope.moreDataCanBeLoaded = true;

    	// 获取积分兑换明细
    	MembershipPointService.getExchangeScoreList($scope.page).then(function (data) {
    		$scope.exchangeScoreLogs = data.scoreLogs;
    		$scope.showLoading = false;
    		// console.log(data.scoreLogs);

            if (data.scoreLogs.length === 0) {
                $ionicPopup.alert({
                    template: "<center>暂无积分兑换明细</center>",
                    okText: '确定',
                    okType: 'button-light'
                }).then(function () {
                    $state.go("membership-point");
                });
            }
    	});

    	$scope.loadMore = function () {
            $scope.page++;

            MembershipPointService.getExchangeScoreList($scope.page).then(function (data) {
                if (data.scoreLogs.length > 0) {
                    data.scoreLogs.forEach(function (scoreLog) {
                        $scope.exchangeScoreLogs.push(scoreLog);
                    });
                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
    	
    });
angular.module('cgwy')
    .controller('GenerateRecordCtrl', function ($scope, $stateParams, $ionicPopup, $state, AlertService, MembershipPointService) {
    	
    	if ($stateParams.availableScore)
    		$scope.availableScore = $stateParams.availableScore;

    	$scope.page = 0;
    	$scope.generateScoreLogs = [];
    	$scope.showLoading = true;
    	$scope.moreDataCanBeLoaded = true;

    	// 获取积分产生明细
    	MembershipPointService.getObtainScoreList($scope.page).then(function (data) {
    		$scope.generateScoreLogs = data.scoreLogs;
    		$scope.showLoading = false;
    		// console.log(data);

            if (data.scoreLogs.length === 0) {
                $ionicPopup.alert({
                    template: "<center>暂无积分产生明细</center>",
                    okText: '确定',
                    okType: 'button-light'
                }).then(function () {
                    $state.go("membership-point");
                });
            }
    	});

    	$scope.loadMore = function () {
            $scope.page++;

            MembershipPointService.getObtainScoreList($scope.page).then(function (data) {
                if (data.scoreLogs.length > 0) {
                    data.scoreLogs.forEach(function (scoreLog) {
                        $scope.generateScoreLogs.push(scoreLog);
                    });
                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
    	
    });
angular.module('cgwy')
    .controller('MembershipPointCtrl', function ($scope, $ionicPopover, ProfileService, AlertService, MembershipPointService) {

        // 获取餐馆名称
    	if (window.sessionStorage['restaurantName']) {
    		$scope.restaurantName = window.sessionStorage['restaurantName'];
    	} else {
    		ProfileService.getRestaurants().then(function (data) {
	            if (data) {
	            	$scope.restaurantName = data[0].name;
	            	window.sessionStorage['restaurantName'] = data[0].name;
	            } else {
	            	AlertService.alertMsg("获取餐馆失败，请返回重试");
	            }
	        });
    	}

        // 获取积分信息
        MembershipPointService.getScore().then(function (data) {
            $scope.score = data;
            // console.log(data);

            if (data.totalScore == null && data.availableScore == null) {
                AlertService.alertMsg("暂无积分信息");
            }
        });

    	$ionicPopover.fromTemplateUrl('templates/pointSharePopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.pointSharePopover = popover;
        });

    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
            $scope.sharerId = profile.id;

            // 积分分享－文案配置
            $scope.title = "都知道在餐馆无忧买食材便宜，哪知道分享给朋友还能赚积分！";
            $scope.description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
            $scope.imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
            $scope.webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + $scope.sharerId + "_score";
			
            $scope.webpageUrlEncode = encodeURIComponent($scope.webpageUrl);
           
            // 分享至微信好友
            $scope.toWeChatFriends = function () {
                if (window.device) {
                    // 微信开放平台
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
                        // console.log("Failed: " + reason);
                    });
                } else {
                    $scope.pointSharePopover.hide();

                    fxGuidePage.style.display = "block";
                }
            }

            // 分享至朋友圈
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
                        // console.log("Failed: " + reason);
                    });
                } else {
                    $scope.pointSharePopover.hide();
                    
                    fxGuidePage.style.display = "block";
                }
            }

            // 分享至短信
	    	$scope.toSendMessage = function () {
	            var message = "都知道餐馆无忧食材便宜，哪知道分享给朋友还能赚积分！http://www.canguanwuyou.cn/www/#/share-page?sharerId=" + $scope.sharerId + "_score";
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
 
        var fxGuidePage = document.getElementById('fxGuidePage');
        var hideBtn = document.getElementById('hideBtn');

        $scope.fxGuidePageFun = function() {
            hideBtn.onclick = function() {
                fxGuidePage.style.display = "none";
            }
        }

        $scope.fxGuidePageFun();

    });
angular.module('cgwy')
    .factory('MembershipPointService', function ($http, $q, apiConfig) {

        var service = {};

        service.getScore = function () {
            return $http({
                url: apiConfig.host + "/api/v2/score",
                method: "GET"
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getObtainScoreList = function (page) {
            return $http({
                url: apiConfig.host + "/api/v2/score/obtain/score-detail",
                method: "GET",
                params: {
                    page: page,
                    pageSize: 10
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getExchangeScoreList = function (page) {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange/score-detail",
                method: "GET",
                params: {
                    page: page,
                    pageSize: 5
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getExchangeCoupon = function () {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange-coupon",
                method: "GET"
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.exchangeScore = function (scoreExchangeData) {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange",
                method: "PUT",
                data: {
                    couponId: scoreExchangeData.couponId,
                    count: scoreExchangeData.count
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                if (payload) {
                    return $q.reject(payload.data);
                }
            });
        };

        return service;
    });


angular.module('cgwy')
    .controller('RedeemPointCtrl', function ($scope, $stateParams, $ionicPopup, $state, AlertService, MembershipPointService) {

    	$scope.restaurantName = $stateParams.restaurantName;

        $scope.showLoading = true;
        $scope.buttonDisabled = false;
        $scope.exchangeRedeemPoint = 0;
        $scope.exchangeCoupons = [];
        $scope.exchangeCouponQuantity = {quantity: 1};

        if ($stateParams.availableScore) {
            $scope.availableScore = $stateParams.availableScore; //实时显示值
            $scope.originAvailableScore = $stateParams.availableScore; //初始值
        } else {
            AlertService.alertMsg("获取可用积分失败");
            $scope.buttonDisabled = true;
        }

        $scope.scoreExchangeData = {
            couponId: null,
            count: null
        };

        // 获取兑换无忧券
        MembershipPointService.getExchangeCoupon().then(function (data) {
            $scope.exchangeCoupons = data;
            $scope.showLoading = false;
            // console.log(data);

            if (data.length > 0) {
                $scope.couponSelectedId = data[0].id;
                $scope.couponSelectedDiscount = data[0].discount;
                $scope.exchangeRedeemPoint = data[0].score; //实时显示值
                $scope.couponSelectedScore = data[0].score; //选中券值

                var available_score = $scope.originAvailableScore - $scope.exchangeRedeemPoint;
                if (available_score >= 0) {
                    $scope.availableScore = available_score;
                } else {
                    $scope.buttonDisabled = true;
                    AlertService.alertMsg("您的积分暂时不够兑换哦");
                    return;
                }
            }
        });

        $scope.couponSelected = function (exchangeCoupon) {
            if ($scope.couponSelectedId !== exchangeCoupon.id) {
                $scope.couponSelectedScore = exchangeCoupon.score;
                var availablescore = $scope.originAvailableScore - $scope.couponSelectedScore;

                if (availablescore >= 0) {
                    $scope.availableScore = availablescore;
                    $scope.couponSelectedId = exchangeCoupon.id;
                    $scope.exchangeCouponQuantity.quantity = 1;
                    $scope.couponSelectedDiscount = exchangeCoupon.discount;
                    $scope.exchangeRedeemPoint = exchangeCoupon.score;
                } else {
                    AlertService.alertMsg("您的积分暂时不够兑换"+ exchangeCoupon.discount +"元的无忧券哦");
                    return;
                }
            } else {
                return;
            }
        };

    	$scope.moreQuantity = function (exchangeCouponQuantity) {
            var _availableScore = $scope.originAvailableScore - $scope.couponSelectedScore * (exchangeCouponQuantity.quantity+1);
            
            if (_availableScore >= 0) {
                exchangeCouponQuantity.quantity = exchangeCouponQuantity.quantity + 1;
            } else {
                AlertService.alertMsg("您的积分最多只能兑换"+ exchangeCouponQuantity.quantity +"张"+ $scope.couponSelectedDiscount +"元无忧券哦");
                return;
            }
        };

        $scope.lessQuantity = function (exchangeCouponQuantity) {
            if (exchangeCouponQuantity.quantity > 1) {
                exchangeCouponQuantity.quantity = exchangeCouponQuantity.quantity - 1;
            }
        };

        $scope.$watch("exchangeCouponQuantity.quantity", function (newVal,oldVal) {
            if (typeof newVal != "undefined" && newVal != oldVal) {

                $scope.exchangeRedeemPoint = $scope.couponSelectedScore * newVal;

                $scope.availableScore = $scope.originAvailableScore - $scope.exchangeRedeemPoint;
            }
        },false);

        $scope.toExchangePoint = function () {
            $ionicPopup.confirm({
                template: '<center>您确定进行兑换？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            }).then(function (res) {
                if (res) {
                    $scope.showLoading = true;
                    $scope.scoreExchangeData.couponId = $scope.couponSelectedId;
                    $scope.scoreExchangeData.count = $scope.exchangeCouponQuantity.quantity;

                    MembershipPointService.exchangeScore($scope.scoreExchangeData).then(function (data) {
                        $scope.showLoading = false;

                        $ionicPopup.alert({
                            template: "<center>恭喜您，成功兑换了"+ $scope.exchangeCouponQuantity.quantity +"张"+ $scope.couponSelectedDiscount +"元的无忧券！</center>",
                            okText: '去看看',
                            okType: 'button-light'
                        }).then(function () {
                            $state.go("membership-point");
                        });
                    }, function (data) {
                        $scope.showLoading = false;

                        AlertService.alertMsg("积分兑换发生异常");
                        return;
                    });
                } else {
                    return;
                }
            });
        };

    });
angular.module('cgwy')
    .controller('ProductCtrl', function (BackUrlUtil, $scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, FavoriteService, Analytics, $timeout, LocationService) {
        //$scope.showLoading = true;
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });

        $scope.scrollInitialized = false;

        if ($stateParams.categoryId) {
            $scope.categorySelectedId = $stateParams.categoryId;
        }

        if($stateParams.mainParentCategoryId){
            BackUrlUtil.setParamers($stateParams.mainParentCategoryId);
        }


        $scope.back = function () {
            $state.go("main.category");
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

        if (LocationService.getChosenCity()) {
            $scope.criteria.cityId = LocationService.getChosenCity().id;
        }

        $scope.reset = function (criteria) {
            criteria.page = 0;
            $scope.skusDisplayed = [];

            if ($scope.scrollInitialized) {
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
                    $scope.datas.push(data)
                    data.skus.forEach(function (sku) {
                        $scope.show(sku);
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
        $scope.status = true;
        $scope.resort = function (sortProperty) {
            $scope.status = false;
            if (sortProperty == $scope.criteria.sortProperty) {
                if ($scope.criteria.sortDirection == 'asc') {
                    $scope.criteria.sortDirection = 'desc';
                } else {
                    $scope.criteria.sortDirection = 'asc';
                }
            } else if (sortProperty == 'salesCount') {
                $scope.status = true;
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
            if (brandId) {
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
                                parent.children.forEach(function(parentItem){
                                    if($stateParams.parentCategoryId == parentItem.id){
                                        $scope.siblingCategories = parentItem.children;
                                    }
                                })
                                //$scope.siblingCategories = parent.children;
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
        $scope.datas = []
        $scope.findSkus = function (criteria) {
            $scope.reset(criteria);
            ProductService.findSkus(criteria).then(function (data) {

                $scope.data = data;
                $scope.datas.push($scope.data);

                data.skus.forEach(function (sku) {
                    $scope.show(sku);
                    $scope.skusDisplayed.push(sku);

                });

                $scope.showLoading = false;

                $scope.total = data.total;

                $scope.find = function () {
                    var toast = document.getElementById('find');
                    toast.innerHTML = "为您找到相关商品约" + $scope.total + "个";
                    toast.style.width = "60%";
                    toast.style.left = "20%";
                    toast.style.top = "80%";
                    toast.className = 'fadeIn animated';
                    $timeout(function () {
                        toast.className = 'hide';
                    }, 2000)
                }

                $timeout(function () {
                    $scope.find();
                }, 500);

                if (data.total == 0) {
                    $scope.to = false;
                } else {
                    $scope.to = true;
                }
            })

        };

        $scope.groupBrands = function (criteria) {
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

        $scope.dial = function () {
            window.open('tel:' + sessionStorage['CSH'], '_system');
        }

        $scope.addSkuIntoCart = function (sku, quantity, bundle) {
            if($scope.inProcess[sku.id] == true)
                return;

            $scope.inProcess[sku.id] = true;
            ProfileService.getProfile().then(function (data) {

                if (data) {

                    ProfileService.getCustomerCityId().then(function (cityId) {
                        if (LocationService.getChosenCity() && cityId == LocationService.getChosenCity().id) {

                            var form = [];

                            form.push({skuId: sku.id, quantity: quantity, bundle: sku.c});
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

                    if(LocationService.getChosenCity().id === 2){
                        $scope.rexianPhone = "028-8774-8154";
                    }else{
                        $scope.rexianPhone = "400-898-1100";
                    }

                    var loginConfirm = $ionicPopup.confirm({
                        template: '<center><div><font color="red">' + $scope.rexianPhone + '</font></div>采购产品请先注册或登录</center>',
                        cancelText: '取消',
                        cancelType: 'button-default',
                        okText: '登录/注册',
                        okType: 'button-assertive'
                    });
                    loginConfirm.then(function (res) {
                        if (res) {
                            $state.go("main.profile");
                        } else {
                            return;
                        }
                    });

                    $scope.inProcess[sku.id] = false;
                }
            }, function (err) {
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

                $timeout(function () {
                    toast.className = 'hide';
                }, 2000)

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

        /*是否显示打包，单品价*/
        $scope.show = function(sku){

            /*是否有打包价*/
            if (sku.bundlePrice.bundleAvailable === true && sku.bundlePrice.bundleInSale === true) {
                $scope.productBundle = true;
            } else {
                $scope.productBundle = false;
            }
            //是否有单品价
            if (sku.singlePrice.singleAvailable === true && sku.singlePrice.singleInSale === true) {
                $scope.productSingle = true;
            } else {
                $scope.productSingle = false;
            }
            sku.b = $scope.productBundle;
            sku.s = $scope.productSingle;

            /*默认显示打包产品*/
            if (sku.b == true && sku.s == true) {
                sku.d = false;
            }
            if (sku.b == true) {
                sku.c = true;
            } else {
                sku.c = false;
            }
            sku.quantity = 1;
            sku.bundleName = "bundleName";
            sku.singleName = "singleName";
        }

        /*
        * 控制商品列表打包，单品选项
        * id表示该商品id
        * name:表示选中打包，或者单品选项名称
        * bundle，single：代表打包/单品，布尔值，ture，选中打包、单品，false,没选中*/

        $scope.oneChange = function (id, name,bundle,single) {
           $scope.datas.forEach(function(data){
                $scope.dataItem(data,id,name,bundle,single)
           })
        }

        $scope.dataItem = function(datas,id,name,bundle,single){
            datas.skus.forEach(function(dataItem){
                dataItem.seletedId = id;
                if(dataItem.seletedId == dataItem.id){
                    if (name == "bundleName") {
                        if (bundle == true) {
                            dataItem.c = true;
                            dataItem.d = false;
                        } else {
                            dataItem.c = false;
                            dataItem.d = true;
                        }
                    } else if (name == "singleName") {
                        if (single == true) {
                            dataItem.c = false;
                            dataItem.d = true;
                        } else {
                            dataItem.c = true;
                            dataItem.d = false;
                        }
                    }
                }
            })
        }

        //商品详情页
        $scope.productDetail = function (skuId) {
            $state.go("product-detail", {id: skuId});
        }

    })

/**
 * Created by J_RH on 2015/7/16 0016.
 */
angular.module('cgwy')
    .controller('ProductDetailCtrl', function ($scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, FavoriteService, Analytics, $timeout,LocationService) {
        //判断是否登录
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });
        //传人商品id获取数据

        if ($stateParams.id) {
            $scope.skuId = $stateParams.id;
            ProductService.findSkusId($scope.skuId).then(function (data) {
                $scope.product = data;
                /*判断是否可加入购物车*/
                if ($scope.product.status.name == "生效") {
                    $scope.productSaleStatus = true;
                } else {
                    $scope.productSaleStatus = false;
                }


                /*自定义变量，用于判断是否有单品，打包，显示单品，打包等问题*/
                $scope.product.bundleName = "bundleName";
                $scope.product.singleName = "singleName";

                if ($scope.product.bundlePrice.bundleAvailable === true && $scope.product.bundlePrice.bundleInSale === true) {
                    $scope.bundle = $scope.productBundle = true;
                } else {
                    $scope.bundle = $scope.productBundle = false;
                }

                if ($scope.product.singlePrice.singleAvailable === true && $scope.product.singlePrice.singleInSale === true) {
                    $scope.single = $scope.productSingle = true;
                } else {
                    $scope.single = $scope.productSingle = false;
                }
                $scope.product.quantity = 1;
            })
        }

        //返回上一页
        $scope.back = function () {
            if ($stateParams.backUrl) {
                $location.url($stateParams.backUrl);
            } else {
                $state.go("search", {"categoryId": $scope.product.category.id})
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
                    toast.style.top = "20%";
                    $timeout(function () {
                        toast.className = 'hide';
                    }, 2000)
                    $ionicListDelegate.closeOptionButtons();
                }

            });
            Analytics.trackEvent('product', 'markFavorite');
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
        $scope.addSkuIntoCart = function (product, quantity, bundle) {
            ProfileService.getProfile().then(function (data) {
                if (data) {
                    var form = [];

                    form.push({skuId: product.id, quantity: quantity, bundle: bundle});

                    CartService.addSkuIntoCart(form).then(function () {
                        var toast = document.getElementById('customToast');
                        toast.innerHTML = "添加成功";
                        toast.className = 'fadeIn animated';
                        toast.style.top = "30%";
                        $timeout(function () {
                            toast.className = 'hide';
                        }, 2000)
                        $scope.recount();
                    });

                    Analytics.trackEvent('cart', 'click', 'addSku');
                } else {
                    if(LocationService.getChosenCity().id === 2){
                        $scope.rexianPhone = "028-8774-8154";
                    }else{
                        $scope.rexianPhone = "400-898-1100";
                    }
                    var loginConfirm = $ionicPopup.confirm({
                        template: '<center><div><font color="red">' + $scope.rexianPhone + '</font></div>采购产品请先注册或登录</center>',
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

        /*单品，打包，单选*/

        $scope.checkboxModel = {
            bundle: true,
            single: false
        };
        $scope.oneChange = function (name, bundle, single) {
            if (name == "bundleName") {
                if (bundle === false) {
                    $scope.checkboxModel.bundle = false;
                    $scope.checkboxModel.single = true;
                    $scope.productBundle = false;
                } else {
                    $scope.checkboxModel.bundle = true;
                    $scope.checkboxModel.single = false;
                    $scope.productBundle = true;
                }
            } else if (name == "singleName") {
                if (single === false) {
                    $scope.checkboxModel.bundle = true;
                    $scope.checkboxModel.single = false;
                    $scope.productBundle = true;
                } else {
                    $scope.checkboxModel.bundle = false;
                    $scope.checkboxModel.single = true;
                    $scope.productBundle = false;
                }

            }
        }

        /*商品详情添加购物车弹框*/
        $ionicPopover.fromTemplateUrl('templates/productCartPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.productCartPopover = popover;
        });


        //显示购物车有多少件物品
        $scope.orderItemsCount = 0;
        $scope.recount = function () {
            $scope.orderItemsCount = 0;
            CartService.getOrderItemCount().then(function (count) {
                $scope.orderItemsCount = count;
            })
        }

        $scope.recount();

        /*隐藏大图*/
        $scope.bigImage = false;    //初始默认大图是隐藏的
        $scope.hideBigImage = function () {
            $scope.bigImage = false;
        };

        /*点击图片显示大图*/
        $scope.shouBigImage = function(imageName){
            imageName = imageName.replace('250', '500');
            $scope.bigUrl = imageName; //$scope定义一个变量Url，这里会在大图出现后再次点击隐藏大图使用
            $scope.bigImage = true; //显示大图
        }

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
angular.module('cgwy')
    .controller('SeckillProductCtrl', function (BackUrlUtil, $scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, Analytics, $timeout, LocationService) {
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });

        $scope.back = function () {
            $state.go("main.home");
        }

        if($stateParams.activeId){
            $scope.activeId = $stateParams.activeId;
        }

        /*秒杀商品*/
        ProductService.seckillProduct($scope.activeId).then(function(datas){
            $scope.datas = datas;
            datas.forEach(function(data){
                data.quantity = 1;
            })
        })

        $scope.moreQuantity = function (data) {
            if( data.quantity>=data.perMaxNum){
                data.quantity = data.perMaxNum;

            }else{
                data.quantity = data.quantity + 1;

            }
        }

        $scope.lessQuantity = function (data) {
            if (data.quantity > 0) {
                data.quantity = data.quantity - 1;
            }
        }

         $scope.dial = function () {
            window.open('tel:' + sessionStorage['CSH'], '_system');
        }

        $scope.inProcess = [];
        $scope.addSkuIntoCart = function (data) {

            if($scope.inProcess[data.sku.id] == true)
             return;

            $scope.inProcess[data.sku.id] = true;
            //判断商品是否被秒杀完
            $scope.numStatus = data.num-data.takeNum;
            if($scope.numStatus<=0){

                return;
            }else{

                 ProfileService.getProfile().then(function (profile) {

                    if (profile) {

                        ProfileService.getCustomerCityId().then(function (cityId) {
                            if (LocationService.getChosenCity() && cityId == LocationService.getChosenCity().id) {

                                var form = [];


                                form.push({skuId:data.sku.id , quantity: data.quantity, bundle: data.bundle,spikeItemId:data.id,cartSkuType:2});
                                CartService.addSkuIntoCart(form).then(function () {
                                    var toast = document.getElementById('customToast');
                                    toast.innerHTML = "添加成功";
                                    toast.className = 'fadeIn animated';
                                    $timeout(function () {
                                        toast.className = 'hide';
                                    }, 2000)
                                    $scope.recount();

                                    $scope.inProcess[data.sku.id] = false;
                                }, function (err) {
                                    $scope.inProcess[data.sku.id] = false;
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

                        if(LocationService.getChosenCity().id === 2){
                            $scope.rexianPhone = "028-8774-8154";
                        }else{
                            $scope.rexianPhone = "400-898-1100";
                        }

                        var loginConfirm = $ionicPopup.confirm({
                            template: '<center><div><font color="red">' + $scope.rexianPhone + '</font></div>采购产品请先注册或登录</center>',
                            cancelText: '取消',
                            cancelType: 'button-default',
                            okText: '登录/注册',
                            okType: 'button-assertive'
                        });
                        loginConfirm.then(function (res) {
                            if (res) {
                                $state.go("main.profile");
                            } else {
                                return;
                            }
                        });

                        $scope.inProcess[data.sku.id] = false;
                    }
                }, function (err) {
                    $scope.inProcess[data.sku.id] = false;
                });
            }
        }


        $scope.orderItemsCount = 0;
        $scope.recount = function () {
            $scope.orderItemsCount = 0;
            CartService.getOrderItemCount().then(function (count) {
                $scope.orderItemsCount = count;
            })
        }

        $scope.recount();



        $scope.gotoCart = function () {
            $state.go("cart", {backUrl: $location.url()});
        }


        //商品详情页
        $scope.productDetail = function (id) {
            $state.go("seckillProduct-detail", {activeId:$scope.activeId,itemId: id});
        }

    })


angular.module('cgwy')
    .controller('SeckillProductDetail', function ($scope, $ionicPopup, $location, $stateParams, $rootScope, $state, $ionicListDelegate, $ionicScrollDelegate, $ionicPopover, $cordovaToast, $q, ProductService, CategoryService, ProfileService, CartService, FavoriteService, Analytics, $timeout,LocationService) {
        //判断是否登录
        ProfileService.getProfile().then(function (profile) {
            if (profile) {
                CartService.getCart();
            }
        });
        //传人商品id获取数据
        if($stateParams.itemId){
            $scope.itemId = $stateParams.itemId;
            ProductService.seckillProductDetail($scope.itemId ).then(function(data){
               $scope.data = data;
                data.quantity = 1;

            })
        }



        //返回上一页
        if($stateParams.activeId){
            $scope.activeId = $stateParams.activeId;
        }

        $scope.back = function () {
            if ($stateParams.backUrl) {
                $location.url($stateParams.backUrl);
            } else {
                $state.go("seckill-product", {activeId: $scope.activeId});
            }
        }

        //进入购物车
        $scope.gotoCart = function () {
            $state.go("cart", {backUrl: $location.url()});
        }

        //加入收藏
        $scope.markFavorite = function () {
            $scope.sku =  $scope.data.sku
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
                    toast.style.top = "20%";
                    $timeout(function () {
                        toast.className = 'hide';
                    }, 2000)
                    $ionicListDelegate.closeOptionButtons();
                }

            });
            Analytics.trackEvent('product', 'markFavorite');
        }


        //加入购物车

        $scope.moreQuantity = function (data) {
            if( data.quantity>=$scope.data.perMaxNum){
                data.quantity = $scope.data.perMaxNum;

            }else{
                data.quantity = data.quantity + 1;

            }

        }

        $scope.lessQuantity = function (data) {
            if (data.quantity > 0) {
                data.quantity = data.quantity - 1;
            }
        }

        //加入购物车
        $scope.inProcess = [];

        $scope.addSkuIntoCart = function (data) {
            if($scope.inProcess[data.sku.id] == true)
                return;

            $scope.inProcess[data.sku.id] = true;
            //判断商品是否被秒杀完
            $scope.numStatus = data.num-data.takeNum;
            if($scope.numStatus<=0){

                return;
            }else{

                ProfileService.getProfile().then(function (profile) {

                    if (profile) {

                        ProfileService.getCustomerCityId().then(function (cityId) {
                            if (LocationService.getChosenCity() && cityId == LocationService.getChosenCity().id) {

                                var form = [];

                                form.push({skuId:data.sku.id , quantity: data.quantity, bundle: data.bundle,spikeItemId:data.id,cartSkuType:2});
                                CartService.addSkuIntoCart(form).then(function () {
                                    var toast = document.getElementById('customToast');
                                    toast.innerHTML = "添加成功";
                                    toast.className = 'fadeIn animated';
                                    toast.style.top = "30%";
                                    $timeout(function () {
                                        toast.className = 'hide';
                                    }, 2000)
                                    $scope.recount();

                                    $scope.inProcess[data.sku.id] = false;
                                }, function (err) {
                                    $scope.inProcess[data.sku.id] = false;
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

                        if(LocationService.getChosenCity().id === 2){
                            $scope.rexianPhone = "028-8774-8154";
                        }else{
                            $scope.rexianPhone = "400-898-1100";
                        }

                        var loginConfirm = $ionicPopup.confirm({
                            template: '<center><div><font color="red">' + $scope.rexianPhone + '</font></div>采购产品请先注册或登录</center>',
                            cancelText: '取消',
                            cancelType: 'button-default',
                            okText: '登录/注册',
                            okType: 'button-assertive'
                        });
                        loginConfirm.then(function (res) {
                            if (res) {
                                $state.go("main.profile");
                            } else {
                                return;
                            }
                        });

                        $scope.inProcess[data.sku.id] = false;
                    }
                }, function (err) {
                    $scope.inProcess[data.sku.id] = false;
                });
            }
        }

        /*商品详情添加购物车弹框*/
        $ionicPopover.fromTemplateUrl('templates/productCartPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.productCartPopover = popover;
        });


        //显示购物车有多少件物品
        $scope.orderItemsCount = 0;
        $scope.recount = function () {
            $scope.orderItemsCount = 0;
            CartService.getOrderItemCount().then(function (count) {
                $scope.orderItemsCount = count;
            })
        }

        $scope.recount();

        /*隐藏大图*/
        $scope.bigImage = false;    //初始默认大图是隐藏的
        $scope.hideBigImage = function () {
            $scope.bigImage = false;
        };

        /*点击图片显示大图*/
        $scope.shouBigImage = function(imageName){
            imageName = imageName.replace('250', '500');
            $scope.bigUrl = imageName; //$scope定义一个变量Url，这里会在大图出现后再次点击隐藏大图使用
            $scope.bigImage = true; //显示大图
        }

    })


angular.module('cgwy')
    .factory('AlertService', function ($http, $ionicPopup) {
        
        var service = {};

        service.alertMsg = function (msg) {
            return $ionicPopup.alert({
                template: '<center>'+ msg +'</center>',
                okText: '确定',
                okType: 'button-light'
            });
        };

        return service;
    })


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

angular.module('cgwy')
    .controller('ProfileCtrl', function ($scope, $rootScope, $state, $ionicPopup, ProfileService, CartService, ActivityService, Analytics,WxReadyService,FavoriteService,AlertService,LocationService,BackUrlUtil,CategoryService) {
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

                ActivityService.reloadActivities().then(function () {
                    $state.go("main.home");
                    console.log(111);
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

        //$scope.gotoView = function (cursor){
        //	var stateName = "restaurant-list";
        //	switch(cursor){
        //		case 2:
        //			stateName = "order-list";
        //			break;
        //		case 3:
        //			stateName = "coupon";
        //			break;
        //        case 4:
        //            stateName = "new-product-feedback";
        //            break;
        //	}
        //	stateName = $scope.profile ? stateName : "login";
        //	$state.go(stateName);
        //}
        //
        //ProfileService.getRestaurants().then(function (data) {
        //    $scope.restaurants = data;


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
                        $scope.hasRestaurants = true;
                    });

                } else {
                    return;
                }
            });
        };

        $scope.complain = function () {
            var complainConfirm = $ionicPopup.confirm({
                template: '<center>确定投诉客服？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            complainConfirm.then(function (res) {
                if (res) {
                    AlertService.alertMsg("投诉成功");
                } else {
                    return;
                }
            });
        };


        if(LocationService.getChosenCity().id === 2){
            window.sessionStorage['CSH'] = "028-8774-8154"; // 成都客服
            $scope.servicePhone = "028-8774-8154";
        }else{
            window.sessionStorage['CSH'] = "400-898-1100";
            $scope.servicePhone = "400-898-1100";
        }


        $scope.dial = function (telephone,state) {
            var msg =  state == 1 ? "确定拨打客服热线" : "确定要拨打的客服专员电话";
            var serviceConfirm = $ionicPopup.confirm({
                template: '<center style="margin-left: -12px;margin-right: -12px;">' + msg + '<div style="color: red;margin-bottom: -10px;">' + telephone + '</div></center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '拨打',
                okType: 'button-assertive'
            });
            serviceConfirm.then(function (res) {
                if (res) {

                    window.open('tel:' + telephone, '_system');
                } else {
                    return;
                }
            });

            //浏览器、微信情况下,物理键返回处理
            if(!ionic.Platform.isWebView()){
                window.onhashchange = function(){
                    serviceConfirm.close(); //关闭
                    window.onhashchange = null;
                }
            }
        }


        if(ionic.Platform.isWebView()) {
            $scope.feedbackAvailable = true;
        }
    })

angular.module('cgwy')
    .factory('ProfileService', function ($http, $q, apiConfig, Analytics, rfc4122,VersionService) {

        var service = {};

        var UNKNOWN = new Object();

        service.setDisplayWelcome = function (displayWelcome) {
            service.displayWelcome = displayWelcome;
        }

        service.isDisplayWelcome = function () {
            return service.displayWelcome;
        }

        service.updateCustomerVersion = function (){
            if(VersionService.versionCode !== 0 && service.profile && service.profile.username){
                return $http({
                    url: apiConfig.host + "/api/v2/upate/customer/versioncode",
                    method: 'GET',
                    params: {versionCode:VersionService.versionCode,username: service.profile.username}
                }).then(function () {
                }, function (payload) {
                    return null
                },
                function (error) {
                })
            }
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

        service.couponEdit = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/order/available-coupon",
                method: 'POST',
                data: array
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
                    telephone: restaurant.telephone,
                    lat : restaurant.lat,
                    lng : restaurant.lng,
                    restaurantAddress : restaurant.restaurantAddress,
                    restaurantStreetNumber : restaurant.restaurantStreetNumber
                }
            }).then(function (payload) {
                return payload.data;
            },function (payload) {
                if (payload.data) {
                    return $q.reject(payload.data);
                }
            })

        };


        service.login = function (user) {
            return $http({
                url: apiConfig.host + "/api/login",
                method: 'POST',
                data: user
            }).then(function (payload) {
                service.profile = payload.data;
                console.log(service.profile);
                // set user id
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id
                Analytics.set('userId', service.profile.id);

                window.localStorage['cachedUsername'] = service.profile.name;

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

        service.bindWxCode = function (code) {
            return $http({
                url: apiConfig.host + "/api/v2/weixin",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {code:code, state:"weixin"}
            })
        }


        service.modifyPassword = function (username, password, newPassword) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant/updatePassword",
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {username: username, password: password, newpassword:newPassword}
            }).then(function (payload) {
                return payload.data;
            })
        };

        return service;
    })
angular.module('cgwy')
    .controller('RegisterCtrl', function ($ionicHistory,$scope, $state, $ionicPopup, $stateParams, ProfileService, LocationService, RestaurantService, Analytics, AlertService, MapService,DeviceUtil) {
    	$scope.goBackView = function(){
    		$ionicHistory.goBack();
    	}

        $scope.cities = [];
		
  		$scope.form = MapService.getViewModel();

  		if($scope.form == undefined){
			$scope.form = {
				telephone: '',
				password: '',
				repeatPassword: '',
				cityId: null,
				cityName: "北京",
				regionId: null,
				restaurantName: '',
				receiver: '',
                contact: '',
				restaurantAddress: '',
				restaurantStreetNumber: '',
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

        LocationService.getCities().then(function (cities) {
            $scope.cities = cities;

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
            if(form.restaurantName === "") {
                AlertService.alertMsg("请填写餐馆名称");
                return;
            }
            if(form.receiver === "") {
                AlertService.alertMsg("请填写收货人");
                return;
            }
            if(form.contact === "") {
                AlertService.alertMsg("请填写收货人电话");
                return;
            }
            if(form.restaurantAddress === "") {
                AlertService.alertMsg("请选择您的餐馆位置");
                return;
            }
            if(form.restaurantStreetNumber === "") {
                AlertService.alertMsg("请输入街道或门牌号等详细信息");
                return;
            }

            ProfileService.register(form).then(function(data) {
                Analytics.trackEvent('profile', 'register', 'success', 1);
				MapService.delViewModel(); //清空地图Service中保留的ViewModel数据

                if(DeviceUtil.status == 1){
                    ProfileService.bindDevice(DeviceUtil.platform,DeviceUtil.deviceId);
                }

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

    });

angular.module('cgwy')
    .controller('SuccessCtrl', function ($scope, $stateParams, ProfileService , BackUrlUtil,LocationService) {

        BackUrlUtil.setBackUrl("main.profile");

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });
        if (LocationService.getChosenCity()) {
            $scope.currentCityId = LocationService.getChosenCity().id;
        }

    	if ($stateParams.sharerId)
    		$scope.isShareRegistSuccess = true;
    	else
    		$scope.isShareRegistSuccess = false;

    	$scope.downloadApp = function () {
    		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.mirror.cgwy";
    	}

        if (window.sessionStorage['CSH'])
            $scope.servicePhone = window.sessionStorage['CSH'];
        else
            $scope.servicePhone = "400-898-1100";
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
    .controller('coupon', function ($scope, $state, ProfileService,$stateParams) {

        $scope.showLoading = true;

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.coupon().then(function (data) {
                    $scope.coupons = data.data;
                    if ($scope.coupons && $scope.coupons.length > 0)
                        $scope.hasCoupons = true;
                    else
                        $scope.hasCoupons = false;

                    $scope.showLoading = false;

                });
            }
        });

        //返回上一页
        $scope.backUrl = 'profile';

        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        }

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
    .controller('RestaurantDetailCtrl', function ($scope, $state, ProfileService, $stateParams, Analytics, AlertService, MapService,$ionicHistory) {

        $scope.goBackView = function(){
            MapService.delViewModel(); //清空地图Service中保留的ViewModel数据
            $ionicHistory.goBack();
        }

        $scope.restaurant = MapService.getViewModel();
        if($scope.restaurant == undefined) {
            $scope.restaurant = {
                name: '',
                receiver: '',
                telephone: '',
                restaurantAddress: '',
                lat: null,
                lng: null,
                restaurantStreetNumber: ''
            }
            ProfileService.getRestaurant($stateParams.id).then(function (data) {
                $scope.restaurant = data;
                $scope.restaurant.restaurantAddress = data.address.address;
                $scope.restaurant.restaurantStreetNumber = data.address.streeNumer;
                $scope.restaurant.lat = data.address.wgs84Point.latitude;
                $scope.restaurant.lng = data.address.wgs84Point.longitude;
            });
        }

        $scope.toMap = function() {
            $state.go('map',{});
            MapService.setViewModel($scope.restaurant);
        }


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
                MapService.delViewModel(); //清空地图Service中保留的ViewModel数据

                $scope.restaurant = data;

                $state.go('restaurant-list');
            },function(data) {
                console.log(data);
                AlertService.alertMsg(data.errmsg);
            });
        }
    })

angular.module('cgwy')
    .controller('RestaurantListCtrl', function ($scope, $state, ProfileService) {

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.getRestaurants().then(function (data) {
                    $scope.restaurants = data;
                });
            }
        });

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

        if ($stateParams.queryWords) {
            $scope.query.keywords = $stateParams.queryWords;
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
                template: '<center>您确定清空所有历史搜索？</center>',
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

angular.module('cgwy')
    .controller('ShareCtrl', function ($scope, $state, ProfileService,WxReadyService,LocationService) {

    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else if (profile.id) {
                $scope.sharerId = profile.id;

                if (LocationService.getChosenCity()) {
                    $scope.currentCityId = LocationService.getChosenCity().id;
                }

                // 分享至微信－文案配置项
                $scope.title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元！";
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
    .factory('UpdateService', ['$q', function ($q) {
        var service = {
            // Check for new updates on js and css files
            check: function () {

                var defer = $q.defer();

                defer.resolve(false);

                return defer.promise;
            },
            // Download new js/css files
            download: function (onprogress) {
                var defer = $q.defer();
                    defer.reject("Unsupported in browser");
                return defer.promise;
            },
            // Update the local files with a new version just downloaded
            update: function (reload) {
            },
            // Check wether the HTML file is cached
            isFileCached: function (file) {
                return false;
            },
            // returns the cached HTML file as a url for HTTP interceptor
            getCachedUrl: function (url) {
                return url;
            }
        };

        return service;

    }])

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

angular.module('cgwy')
    .factory('BackUrlUtil', function ($ionicHistory,$timeout) {
	    var service = {};

		//保存页面返回URL
		service.setBackUrl = function (backUrl) {
			service.backUrl = backUrl;
		}

		//获取页面URL
		service.getBackUrl = function () {
			return service.backUrl;
		}

		//保存页面参数
		service.setParamers = function (paramers) {
			service.paramers = paramers;
		}

		service.getParamers = function (){
			return service.paramers;
		}


		//销毁数据
		service.destory = function (){
			service.backUrl = null;
		}

		service.destoryParamers = function() {
			service.paramers = null;
		}
  
    return service;
});

angular.module('cgwy')
    .factory('DeviceUtil', function () {
	    var service = {};
		service.deviceId = null;
		service.platform = null;
		service.status = 0; //0:无状态 | 1:成功 | 2:失败 | 3:plugin获取异常

		service.getDeviceId = function (){
			var devicePlugin = null;
			try{
				devicePlugin = cordova.plugins.DeviceId; //DeviceId
				devicePlugin.getDeviceId("",bdOnSuccess,bdOnError);
			}catch(e){
				console.log("DevicePlugin 获取异常 ---- cgwy.error");
				service.status = 3;
			}
		}

		var bdOnSuccess = function(entry){
			service.deviceId = entry.deviceid;
			service.platform = entry.platform;
			service.status = 1;
			console.log("DevicePlugin :" + service.deviceId);
			console.log("DevicePlugin :" + service.platform);
		}

		var bdOnError = function(error){
			service.status = 2;
		}
  
    return service;
});

angular.module('cgwy')
    .factory('HistoryUtil', function ($ionicHistory,$timeout) {
	    var service = {};

        /**
         *  返回stateName 相对的上一页面
         *  主要处理ion-tab ui-sref="..." 重新在viewHistory.histories建立新分支,
         *  导致$ionicHistory.goBack() 或者 $ionicHistory.goBack([backCount]) 无法返回的问题
         */
		service.goBackView = function (stateName) {
		
			var views = $ionicHistory.viewHistory().views;
    		var viewHistory = $ionicHistory.viewHistory();
    		var stackViews = $ionicHistory.viewHistory().histories["root"].stack;
    		var currentView = null;

			var i = stackViews.length-1;
			while(i >= 0){
				var view = stackViews[i];
				if(view.stateName == stateName){
					currentView = view;
					break;
				}
				i--;
			}
    		
			viewHistory.currentView = currentView ? currentView : null;
    		viewHistory.backView = views[viewHistory.currentView.backViewId] ?  views[viewHistory.currentView.backViewId] : null;
		    viewHistory.forwardView = views[viewHistory.currentView.forwardViewId] ? views[viewHistory.currentView.forwardViewId] : null;

    		
     		var currentHistory = viewHistory.histories[currentView.historyId];
			var newCursor = currentHistory.cursor ;
			if (newCursor < 1) {
			  newCursor = 1;
			}
			
			currentHistory.cursor = newCursor;

    		var cursor = newCursor - 1;
        	var clearStateIds = [];
	        var fwdView = views[currentHistory.stack[cursor].forwardViewId];
	        
	        while (fwdView) {
			  clearStateIds.push(fwdView.stateId || fwdView.viewId);
			  cursor++;
			  if (cursor >= currentHistory.stack.length) break;
			  fwdView = views[currentHistory.stack[cursor].forwardViewId];
			}
        
        
			if (clearStateIds.length) {
			  $timeout(function() {
				$ionicHistory.clearCache(clearStateIds);
			  }, 600);
			}
        
        	 viewHistory.backView && viewHistory.backView.go();
        }
  
    return service;
});

angular.module('cgwy')
    .factory('NetworkUtil', function () {
	    var service = {};

		/*
			states[Connection.UNKNOWN]  = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI]     = 'WiFi connection';
			states[Connection.CELL_2G]  = 'Cell 2G connection';
			states[Connection.CELL_3G]  = 'Cell 3G connection';
			states[Connection.CELL_4G]  = 'Cell 4G connection';
			states[Connection.CELL]     = 'Cell generic connection';
			states[Connection.NONE]     = 'No network connection';
		*/

		service.getNetworkRs = function (){
			try{
				var networkState = navigator.connection.type;
				if(networkState === "wifi" || networkState === "ethernet" ||
					networkState === "3g" || networkState === "4g")
					return true;
				else
					return false;
			}catch(e){
				return false;
			}
		}

    return service;
});

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
            var title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元！";
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
        service.getAccess_token = function (url) {
            /**
             * 微信推荐
             *  url从  http://www.canguanwuyou.cn/www/browser.html
             *  改变为 http://www.canguanwuyou.cn/www/browser.html?from=singlemessage&isappinstalled=0
             *  导致省生成微信 signature 不正确,无法正确使用微信sdk
             *  扩展url参数
             *  by linsen 2015.10.15
             * */
            var array = url.split("#");
            return  $http({
                url: "http://www.canguanwuyou.cn/wechat",
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: "url="+encodeURIComponent(array[0])
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

angular.module('cgwy')
    .controller('CategoryCtrl', function ($scope, BackUrlUtil,CategoryService, $state, AlertService, Analytics) {
        CategoryService.updateCategory();
        CategoryService.getLevel1Categories().then(function (data) {
            $scope.categories = data;
            if(BackUrlUtil.getParamers()){
                $scope.selectedCategoryId = BackUrlUtil.getParamers();
                BackUrlUtil.destoryParamers();
            }else{
                $scope.selectedCategoryId = data[0].id;
            }

            if($scope.categories.length > 0) {
                $state.go("main.category.sub", {id:$scope.selectedCategoryId});
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
    .factory('CategoryService', function ($http, $q, apiConfig,ProfileService,LocationService) {

        var service = {};

        function getCategory() {
            var cityMessage = LocationService.getChosenCity();
            if(cityMessage){
                var cityId = cityMessage.id;
            }else{
                LocationService.getCurrentCity().then(function(){
                     return cityId = LocationService.locationCity().cityId;
                })
            }
            return $http({
                url: apiConfig.host + "/api/v2/new/category?cityId="+cityId,
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


        var promise  = getCategory();

        function getCategoryPromise() {
            return promise.then(function(data) {
                return promise ;
            }, function() {
                promise = getCategory();
                return promise;
            })
        }

        service.updateCategory = function(){
            promise  = getCategory();
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
        service.getLevel1Categories = function () {
            return getCategoryPromise().then(function (data) {
                return data.level1Categories;
            });
        }
        return service;
    })

angular.module('cgwy')
    .controller('SubCategoryCtrl', function ($scope, CategoryService, $stateParams,Analytics,LocationService) {
        CategoryService.getCategory($stateParams.id).then(function (data) {
            $scope.id = $stateParams.id;
            $scope.categories = [];

            data.children.forEach(function (v) {
                $scope.categories.push(v);
            })


            //判断是不是特价商品,505代表特价商品，后台需求传递id = -1，用于查询特价商品
            if($scope.categories[0].id==505){
                $scope.categories[0].id=-1;
            }

            /*为分类加下划线*/
            $scope.categoriesOne = [];
            $scope.categoriesTwo = [];
            $scope.categoriesThree = [];
            $scope.categoriesFour = [];
            $scope.categoriesFive = [];
            $scope.categoriesSix = [];

            for (var i = 0; i < 4; i++) {
                $scope.categoriesOne.push($scope.categories[i]);
            }
            for (var i = 4; i < 8; i++) {
                $scope.categoriesTwo.push($scope.categories[i]);
            }
            for (var i = 8; i < 10; i++) {
                $scope.categoriesThree.push($scope.categories[i]);
            }
            for (var i = 10; i < 14; i++) {
                $scope.categoriesFour.push($scope.categories[i]);
            }
            for (var i = 14; i < 16; i++) {
                $scope.categoriesFive.push($scope.categories[i]);
            }
            for (var i = 16; i < $scope.categories.length; i++) {
                $scope.categoriesSix.push($scope.categories[i]);
            }

            //区别显示北京，成都调味油类的东西
            if(LocationService.getChosenCity().id == 1){
                $scope.cate = $scope.categoriesSix[1]
                $scope.categoriesSix[1] = $scope.categoriesSix[3];
                $scope.categoriesSix[3] = $scope.cate;
            }

        })
    })