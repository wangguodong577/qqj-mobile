angular.module('cgwy')
    .controller('ActivityCtrl', function ($scope, $stateParams, ActivityService) {
        if(ActivityService.banners && ActivityService.banners[$stateParams.index]) {
            var banner = ActivityService.banners[$stateParams.index];

            $scope.contentUrl = banner.redirectUrl;

        }

    })
