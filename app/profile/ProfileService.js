angular.module('cgwy')
    .factory('ProfileService', function ($http, $q, apiConfig, Analytics, rfc4122,VersionService) {

        var service = {};

        var UNKNOWN = new Object();

        service.setDisplayWelcome = function (displayWelcome) {
            service.displayWelcome = displayWelcome;
        }

        service.isDisplayWelcome = function () {
            return service.displayWelcome;
        }

        service.updateCustomerVersion = function (){
            if(VersionService.versionCode !== 0 && service.profile && service.profile.username){
                return $http({
                    url: apiConfig.host + "/api/v2/upate/customer/versioncode",
                    method: 'GET',
                    params: {versionCode:VersionService.versionCode,username: service.profile.username}
                }).then(function () {
                }, function (payload) {
                    return null
                },
                function (error) {
                })
            }
        }

        service.getProfile = function () {
            if (service.profile) {
                var deferred = $q.defer();

                if (service.profile === UNKNOWN) {
                    Analytics.set('userId', null);
                    deferred.resolve(null);
                } else {
                    Analytics.set('userId', service.profile.id);
                    deferred.resolve(service.profile);
                }
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/customer",
                    method: 'GET'
                }).then(function (payload) {
                    service.profile = payload.data;
                    Analytics.set('userId', service.profile.id);
                    return service.profile;
                }, function (error) {
                    console.log(error);
                    Analytics.set('userId', null);
                    service.profile = UNKNOWN;
                    return null;
                })
            }
        };

        service.getCustomerCityId = function() {
            var cityId = 1;

            if (service.profile && service.profile.block) {
                var deferred = $q.defer();

                deferred.resolve(service.profile.block.city.id);
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/customer",
                    method: 'GET'
                }).then(function (payload) {
                    service.profile = payload.data;
                    if(service.profile.block) {
                        cityId = service.profile.block.city.id;
                    } else if(service.profile.zone) {
                        cityId = service.profile.zone.warehouse.city.id;
                    }

                    return cityId;
                }, function (error) {
                    return cityId;
                })
            }
        }

        service.anyValidatedRestaurants = function (restaurants) {
            var anyValidatedRestaurants = false;
            restaurants.forEach(function (r) {
                if (r.status.value == 2) {
                    anyValidatedRestaurants = true;
                }
            });

            return anyValidatedRestaurants;
        }

        service.containsValidatedRestaurants = function () {
            if (service.restaurants) {
                var deferred = $q.defer();
                deferred.resolve(service.anyValidatedRestaurants(service.restaurants));
                return deferred.promise;
            } else {
                return $http({
                    url: apiConfig.host + "/api/v2/restaurant",
                    method: 'GET'
                }).then(function (payload) {
                    service.restaurants = payload.data;
                    return service.anyValidatedRestaurants(service.restaurants);
                }, function (error) {
                    console.log(error);
                    return false;
                })
            }
        };

        service.checkUserName = function (username) {
            return $http({
                url: apiConfig.host + "/api/v2/check-username",
                method: 'GET',
                params: {username: username}
            }).then(function () {
            }, function (payload) {
                return $q.reject(payload.data)
            })
        };

        service.coupon = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/coupon",
                method: 'GET'
            }).then(function (data) {
                return data;
            }, function (payload) {
                return $q.reject(payload.data)
            })
        }

        service.couponEdit = function (array) {
            return $http({
                url: apiConfig.host + "/api/v2/order/available-coupon",
                method: 'POST',
                data: array
            }).then(function (data) {
                return data;
            }, function (payload) {
                return $q.reject(payload.data)
            })
        }

        service.getRestaurants = function () {
            // if (service.restaurants) {
            //     var deferred = $q.defer();
            //     deferred.resolve(service.restaurants);
            //     return deferred.promise;
            // } else {
                return service.forceRefreshRestaurants();
            // }
        };


        service.forceRefreshRestaurants = function () {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant",
                method: 'GET'
            }).then(function (payload) {
                service.restaurants = payload.data;
                return payload.data;
            }, function (error) {
                console.log(error);
                return [];
            })
        }


        service.getRestaurant = function (id) {
            return service.getRestaurants().then(function (restaurants) {
                for (var i = 0; i < restaurants.length; i++) {
                    if (restaurants[i].id == id) {
                        return restaurants[i];
                    }
                }

                return null;
            })
        };

        service.updateRestaurant = function (restaurant) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant/" + restaurant.id,
                method: 'PUT',
                data: {
                    id: restaurant.id,
                    name: restaurant.name,
                    realname: restaurant.receiver,
                    telephone: restaurant.telephone,
                    lat : restaurant.lat,
                    lng : restaurant.lng,
                    restaurantAddress : restaurant.restaurantAddress,
                    restaurantStreetNumber : restaurant.restaurantStreetNumber
                }
            }).then(function (payload) {
                return payload.data;
            },function (payload) {
                if (payload.data) {
                    return $q.reject(payload.data);
                }
            })

        };


        service.login = function (user) {
            return $http({
                url: apiConfig.host + "/api/v2/login",
                method: 'POST',
                data: user
            }).then(function (payload) {
                service.profile = payload.data;

                // set user id
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id
                Analytics.set('userId', service.profile.id);

                window.localStorage['cachedUsername'] = service.profile.username;

                return service.profile;
            }, function (payload) {
                if(payload.status === 0) {
                    return $q.reject({errno : -1, errmsg: "网络异常"})
                }

                if (payload.data) {
                    return $q.reject(payload.data);
                }

            })
        };

        service.logout = function () {
            return $http({
                url: apiConfig.host + "/api/v2/logout",
                method: 'GET'
            }).then(function () {
                service.profile = null;
                service.restaurants = null;

                // set user id
                // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-id
                Analytics.set('userId', null);
            })
        };

        service.register = function (user) {
            return $http({
                url: apiConfig.host + "/api/v2/register",
                method: 'POST',
                data: user
            }).then(function (payload) {
                service.profile = null;
                service.getProfile();
                return payload.data;
            }, function (payload) {
                if (payload.data) {
                    return $q.reject(payload.data);
                }
            })
        };

        service.askCode = function (telephone) {
            return $http({
                url: apiConfig.host + "/api/v2/code",
                method: 'GET',
                params: {telephone: telephone}
            })
        };

        service.transformRequest = function (obj) {
            var str = [];
            for (var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        }


        service.checkCode = function (telephone, code) {
            return $http({
                url: apiConfig.host + "/api/v2/code",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {telephone: telephone, code: code}
            }).then(function (payload) {
                return payload.data;
            }, function (error) {
                return $q.reject(error.data);
            })
        };

        service.resetPassword = function (telephone, code, password) {
            return $http({
                url: apiConfig.host + "/api/v2/" + telephone + "/reset-password",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {code: code, password: password}
            }).then(function (payload) {
                return payload.data;
            })
        };

        service.couponInfo = [];
        service.setCouponInfo = function (couponInfo) {
            service.couponInfo = couponInfo;
        };
        service.bindBaiduPush = function (platform, baiduChannelId) {
            if (baiduChannelId) {
                service.baiduChannelId = baiduChannelId;
            }

            if (service.baiduChannelId) {
                service.getProfile().then(function (profile) {
                    if (profile) {
                        return $http({
                            url: apiConfig.host + "/api/v2/push",
                            method: 'PUT',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            transformRequest: service.transformRequest,
                            data: {baiduChannelId: service.baiduChannelId, platform: platform}
                        })
                    }
                })
            }
        }

        service.getCouponInfo = function () {
            return service.couponInfo;
        };

        service.createRestaurant = function (restaurant) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant",
                method: 'POST',
                data: restaurant
            }).then(function (payload) {
                service.forceRefreshRestaurants();
                return payload.data;
            }, function (error) {
                return $q.reject(error.data);
            })
        }

        service.getDeviceId = function () {
            if (window.localStorage['deviceId']) {
                console.log('deviceId:' + window.localStorage['deviceId']);
                return window.localStorage['deviceId'];
            } else {
                window.localStorage['deviceId'] = rfc4122.v4();
                console.log('deviceId:' + window.localStorage['deviceId']);
                return window.localStorage['deviceId'];
            }
        }

        service.bindDevice = function (platform, deviceId) {
            if (deviceId) {
                return $http({
                    url: apiConfig.host + "/api/v2/device",
                    method: 'PUT',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: service.transformRequest,
                    data: {deviceId: deviceId, platform: platform}
                })
            }
        }

        service.bindWxCode = function (code) {
            return $http({
                url: apiConfig.host + "/api/v2/weixin",
                method: 'PUT',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {code:code, state:"weixin"}
            })
        }


        service.modifyPassword = function (username, password, newPassword) {
            return $http({
                url: apiConfig.host + "/api/v2/restaurant/updatePassword",
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: service.transformRequest,
                data: {username: username, password: password, newpassword:newPassword}
            }).then(function (payload) {
                return payload.data;
            })
        };

        return service;
    })