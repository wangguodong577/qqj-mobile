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
