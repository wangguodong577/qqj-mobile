angular.module('cgwy')
    .controller('GenerateRecordCtrl', function ($scope, $stateParams, $ionicPopup, $state, AlertService, MembershipPointService) {
    	
    	if ($stateParams.availableScore)
    		$scope.availableScore = $stateParams.availableScore;

    	$scope.page = 0;
    	$scope.generateScoreLogs = [];
    	$scope.showLoading = true;
    	$scope.moreDataCanBeLoaded = true;

    	// 获取积分产生明细
    	MembershipPointService.getObtainScoreList($scope.page).then(function (data) {
    		$scope.generateScoreLogs = data.scoreLogs;
    		$scope.showLoading = false;
    		// console.log(data);

            if (data.scoreLogs.length === 0) {
                $ionicPopup.alert({
                    template: "<center>暂无积分产生明细</center>",
                    okText: '确定',
                    okType: 'button-light'
                }).then(function () {
                    $state.go("membership-point");
                });
            }
    	});

    	$scope.loadMore = function () {
            $scope.page++;

            MembershipPointService.getObtainScoreList($scope.page).then(function (data) {
                if (data.scoreLogs.length > 0) {
                    data.scoreLogs.forEach(function (scoreLog) {
                        $scope.generateScoreLogs.push(scoreLog);
                    });
                } else {
                    $scope.moreDataCanBeLoaded = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };
    	
    });