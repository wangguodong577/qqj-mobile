angular.module('cgwy')
    .factory('CartService', function ($http, $q, apiConfig, $state, $rootScope) {
        var service = {};

        service.getCart = function () {
            if(service.cart) {
                var deferred = $q.defer();
                deferred.resolve(service.cart);
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/cart",
                    method: 'GET'
                }).then(function (payload) {
                    if (payload.data.id) {
                        service.cart = payload.data;
                        return payload.data;
                    } else {
                        return null;
                    }
                })
            }
        };

        service.getOrderItemCount = function() {
            var orderItemsCount = 0;
            return service.getCart().then(function (cart) {
                if (cart) {
                    cart.orderItems.forEach(function(e) {
                        orderItemsCount += e.quantity;
                    })

                }

                return orderItemsCount;
            })
        }

        service.resetCart = function() {
            service.cart = null;
        }

        service.addSkuIntoCart = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/cart",
                method: 'POST',
                data: array
            }).then(function (payload) {
                service.cart = payload.data;
                return payload.data;
            }, function (error) {
                $state.go("login");
            })
        };

        service.syncCart = function () {
            if(service.cart && service.cart.orderItems) {
                var cart = service.cart;
                var skuArray = [];
                cart.orderItems.forEach(function (orderItem) {
                    skuArray.push({
                        skuId: orderItem.sku.id,
                        quantity: orderItem.quantity,
                        bundle:orderItem.bundle
                    })
                });

                return $http({
                    url: apiConfig.host + "/api/v2/cart",
                    method: 'PUT',
                    data: skuArray
                }).then(function (payload) {
                    service.cart = payload.data;
                    return payload.data;
                })
            }
        };

        service.checkStockOut = function(array) {
            return $http({
                        url: apiConfig.host + "/api/v2/order/stock",
                        method: 'PUT',
                        data: array
                }).then(function (payload) {
                    return payload.data;
                })
        }

        service.removeSkuFromCart = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/cart",
                method: 'DELETE',
                params: {itemIds:array}
            }).then(function (payload) {
                service.cart = payload.data;
                return payload.data;
            }, function (error) {
                $state.go("login");
            })
        };
        //contentType: "application/json;charset=utf-8"


        service.chosenItem = [];
        service.setChosenItem = function(chosenItem) {
            service.chosenItem = chosenItem;
        };

        service.getChosenItem = function(){
            return service.chosenItem;
        };

        return service;
    })