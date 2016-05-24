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

