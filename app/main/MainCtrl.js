angular.module('cgwy')
    .controller('MainCtrl', function ($scope, $state, $stateParams, $rootScope) {
        if($stateParams.code) {
            $rootScope.wxcode = $stateParams.code;

        }
    });
