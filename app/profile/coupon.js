angular.module('cgwy')
    .controller('coupon', function ($scope, $state, ProfileService,$stateParams) {

        $scope.showLoading = true;

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.coupon().then(function (data) {
                    $scope.coupons = data.data;
                    if ($scope.coupons && $scope.coupons.length > 0)
                        $scope.hasCoupons = true;
                    else
                        $scope.hasCoupons = false;

                    $scope.showLoading = false;

                });
            }
        });

        //返回上一页
        $scope.backUrl = 'profile';

        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        }

    });