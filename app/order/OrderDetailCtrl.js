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
