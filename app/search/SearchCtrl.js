angular.module('cgwy')
    .controller('SearchCtrl', function ($scope, $ionicPopup, $state, $stateParams) {

    	$scope.query = { keywords : "" };

        $scope.backUrl = '/main/category';
        if ($stateParams.backUrl) {
            $scope.backUrl = $stateParams.backUrl;
        }

        if ($stateParams.queryWords) {
            $scope.query.keywords = $stateParams.queryWords;
        }

    	$scope.historyQuery = [];
    	$scope.localStorageHistoryQuery = [];

    	$scope.$watch('query.keywords', function (newVal) {
            if($scope.query.keywords != undefined && $scope.query.keywords != "") {
                $scope.hasQuery = true;
            }else {
                $scope.hasQuery = false;
            }
        })

    	$scope.clearQuery = function () {
            $scope.query.keywords = "";
        }

        $scope.toQuerySearch = function () {
        	if ($scope.query.keywords) {
        		$scope.historyQuery = JSON.parse(window.localStorage.getItem('historyQuery') || '[]');

                var historyQueryLength = $scope.historyQuery.length;

        		if (historyQueryLength > 0 && historyQueryLength < 10) {
                    $scope.setLocalStorageHistoryQuery();
        		} else if (historyQueryLength == 0) {
                    $scope.historyQuery.push($scope.query.keywords);

                    window.localStorage['historyQuery'] = JSON.stringify($scope.historyQuery);
                } else if (historyQueryLength >= 10) {
                    $scope.historyQuery.splice(0,1);

                    $scope.setLocalStorageHistoryQuery();
                }
                //categoryId:undefined 在使用软键盘的搜索按钮时,会带着categoryId参数,所以需要在此置空改参数,否则不会执行全局搜索商品  by linsen
                $state.go('search',{backUrl: $scope.backUrl,query: $scope.query.keywords,categoryId:undefined});
        	}
        }

        $scope.setLocalStorageHistoryQuery = function () {
            for (var i=0; i < $scope.historyQuery.length; i++) {
                if ($scope.query.keywords == $scope.historyQuery[i]) {
                    $scope.historyQuery.splice(i,1);
                } 
            }   

            $scope.historyQuery.push($scope.query.keywords);

            window.localStorage['historyQuery'] = JSON.stringify($scope.historyQuery);
        }
 
        var localStorageHistoryQueryArr = JSON.parse(window.localStorage.getItem('historyQuery') || '[]');

        if (localStorageHistoryQueryArr.length > 0) {
        	for (var i=0; i < localStorageHistoryQueryArr.length; i++) {
        		$scope.localStorageHistoryQuery.push(localStorageHistoryQueryArr[i]);
        	}

            $scope.hasHistoryQuery = true;

            $scope.localStorageHistoryQuery.reverse();
        } else {
            $scope.localStorageHistoryQuery = [];

            $scope.hasHistoryQuery = false;
        }
    

    	$scope.clearHistoryQuery = function () {
    		var clearConfirm = $ionicPopup.confirm({
                template: '<center>您确定清空所有历史搜索？</center>',
                cancelText: '取消',
                cancelType: 'button-default',
                okText: '确定',
                okType: 'button-assertive'
            });
            clearConfirm.then(function (res) {
                if (res) {
                    while($scope.localStorageHistoryQuery.length > 0) {
                    	$scope.localStorageHistoryQuery.pop();
                    }

                    $scope.hasHistoryQuery = false;

                    window.localStorage.removeItem('historyQuery');
                } else {
                    return;
                }
            });
    	}

    })