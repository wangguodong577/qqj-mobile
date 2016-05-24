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
