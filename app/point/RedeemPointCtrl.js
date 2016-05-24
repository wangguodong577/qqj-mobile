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