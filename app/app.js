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
        "host": "http://www.canguanwuyou.cn"
        //"host":"http://114.215.100.12:8083/",
        //"host": "",
        //"environment": "develop"

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

