angular.module('cgwy')
    .controller('SuccessCtrl', function ($scope, $stateParams, ProfileService , BackUrlUtil,LocationService) {

        BackUrlUtil.setBackUrl("main.profile");

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
        });
        if (LocationService.getChosenCity()) {
            $scope.currentCityId = LocationService.getChosenCity().id;
        }

    	if ($stateParams.sharerId)
    		$scope.isShareRegistSuccess = true;
    	else
    		$scope.isShareRegistSuccess = false;

    	$scope.downloadApp = function () {
    		window.location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.mirror.cgwy";
    	}

        if (window.sessionStorage['CSH'])
            $scope.servicePhone = window.sessionStorage['CSH'];
        else
            $scope.servicePhone = "400-898-1100";
    });