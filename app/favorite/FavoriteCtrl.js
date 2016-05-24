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