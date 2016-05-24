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
