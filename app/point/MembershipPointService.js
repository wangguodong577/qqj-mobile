angular.module('cgwy')
    .factory('MembershipPointService', function ($http, $q, apiConfig) {

        var service = {};

        service.getScore = function () {
            return $http({
                url: apiConfig.host + "/api/v2/score",
                method: "GET"
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getObtainScoreList = function (page) {
            return $http({
                url: apiConfig.host + "/api/v2/score/obtain/score-detail",
                method: "GET",
                params: {
                    page: page,
                    pageSize: 10
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getExchangeScoreList = function (page) {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange/score-detail",
                method: "GET",
                params: {
                    page: page,
                    pageSize: 5
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.getExchangeCoupon = function () {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange-coupon",
                method: "GET"
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            });
        };

        service.exchangeScore = function (scoreExchangeData) {
            return $http({
                url: apiConfig.host + "/api/v2/score/exchange",
                method: "PUT",
                data: {
                    couponId: scoreExchangeData.couponId,
                    count: scoreExchangeData.count
                }
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                if (payload) {
                    return $q.reject(payload.data);
                }
            });
        };

        return service;
    });

