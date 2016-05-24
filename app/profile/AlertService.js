angular.module('cgwy')
    .factory('AlertService', function ($http, $ionicPopup) {
        
        var service = {};

        service.alertMsg = function (msg) {
            return $ionicPopup.alert({
                template: '<center>'+ msg +'</center>',
                okText: '确定',
                okType: 'button-light'
            });
        };

        return service;
    })

