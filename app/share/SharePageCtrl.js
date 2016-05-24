angular.module('cgwy')
    .controller('SharePageCtrl', function ($scope, $stateParams) {

    	if ($stateParams.sharerId) {
    		$scope.sharerId = $stateParams.sharerId;
    	}
    	
    });