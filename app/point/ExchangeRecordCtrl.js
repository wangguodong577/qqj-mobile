angular.module('cgwy')
    .controller('ExchangeRecordCtrl', function ($scope, $stateParams, $ionicPopup, $state, AlertService, MembershipPointService) {

    	if ($stateParams.availableScore)
    		$scope.availableScore = $stateParams.availableScore;

    	$scope.page = 0;
    	$scope.exchangeScoreLogs = [];
    	$scope.showLoading = true;
    	$scope.moreDataCanBeLoaded = true;

    	// 获取积分兑换明细
    	MembershipPointService.getExchangeScoreList($scope.page).then(function (data) {
    		$scope.exchangeScoreLogs = data.scoreLogs;
    		$scope.showLoading = false;
    		// console.log(data.scoreLogs);

            if (data.scoreLogs.length === 0) {
                $ionicPopup.alert({
                    template: "<center>暂无积分兑换明细</center>",
                    okText: '确定',
                    okType: 'button-light'
                }).then(function () {
                    $state.go("membership-point");
                });
            }
    	});

    	$scope.loadMore = function () {
            $scope.page++;

            MembershipPointService.getExchangeScoreList($scope.page).then(function (data) {
                if (data.scoreLogs.length > 0) {
                    data.scoreLogs.forEach(function (scoreLog) {
                        $scope.exchangeScoreLogs.push(scoreLog);
                    });
                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
    	
    });