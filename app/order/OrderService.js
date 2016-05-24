angular.module('cgwy')
    .factory('OrderService', function ($http, $q, apiConfig, $state, $rootScope) {

        var service = {};

        //记录返回页面,提供给物理返回键
        service.setBackURL = function (backURL) {
            service.backURL = backURL;
        }
        service.getBackURL = function () {
            return service.backURL;
        }


        service.getTodayOrders = function () {
            return $http({
                url: apiConfig.host + "/api/v2/today-order",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.getOrders = function (object) {
            return $http({
                url: apiConfig.host + "/api/v2/order",
                method: 'GET',
                params: {page: object.page,pageSize:object.pageSize}
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.getOrder = function (id) {
            return $http({
                url: apiConfig.host + "/api/v2/order/" + id,
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.cancelOrder = function (object) {
            var url = apiConfig.host + "/api/v2/order/" + object.orderId;
            if (object.deviceId) {
                url = url + "?"+"deviceId="+object.deviceId;
            }
            return $http({
                url: url,
                method: 'DELETE'
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.previewOrder = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/order/preview",
                method: 'POST',
                data: array
            }).then(function (payload) {
                return payload.data;
            }, function(payload) {
                return $q.reject(payload.data);
            })
        };

        service.submitOrder = function (orderInfo) {
            return $http({
                url: apiConfig.host + "/api/v2/order-coupon",
                method: 'POST',
                data: {
                    cartRequestList: orderInfo.skuarray,
                    couponId: orderInfo.couponId,
                    deviceId: orderInfo.deviceId,
                    bundle:orderInfo.bundle
                }
            }).then(function (payload) {
                return payload.data;
            }, function(payload) {
                return $q.reject(payload.data);
            })
        };

        service.submitOrderEvaluation = function (orderId, formData) {
            return $http({
                url: apiConfig.host + "/api/v2/"+ orderId +"/evaluate",
                method: 'POST',
                data: formData
            }).then(function (payload) {
                return payload.data;
            }, function (payload) {
                return $q.reject(payload.data);
            })
        }

        service.getOrderEvaluation = function (orderId) {
            return $http({
                url: apiConfig.host + "/api/v2/order/evaluate/" + orderId,
                method: "GET"
            }).then(function (data) {
                return data.data;
            })
        }

        return service;
    })

