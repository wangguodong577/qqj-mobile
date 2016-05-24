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