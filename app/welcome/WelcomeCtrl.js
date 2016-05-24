angular.module('cgwy')
    .controller('WelcomeCtrl', function ($scope, $state) {
        if(window.localStorage['isWelcomeShowed']) {
            $state.go("main.home");
        }

        $scope.goHome = function() {
            window.localStorage['isWelcomeShowed'] =  true;
            $state.go("main.home");
        }

    });
