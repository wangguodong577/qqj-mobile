angular.module('cgwy')
    .controller('RestaurantListCtrl', function ($scope, $state, ProfileService) {

        ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else {
                ProfileService.getRestaurants().then(function (data) {
                    $scope.restaurants = data;
                });
            }
        });

    })
