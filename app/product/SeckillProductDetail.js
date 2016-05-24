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

