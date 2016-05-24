angular.module('cgwy')
    .service('LocationService', function ($http, $q, apiConfig, ProfileService) {
        this.getCities = function () {
            return $http({
                url: apiConfig.host + "/api/v2/city",
                method: 'GET'
            }).then(function (payload) {
                return payload.data;
            });
        };

        //根据定位获取城市
        var that = this;
        this.locationCity = function () {
            return this.getCurrentCity().then(function (currentCity) {
                var cityMessage = {};
                if (currentCity.data.status === 0) {
                    var location_city_code = currentCity.data.content.address_detail.city_code;
                    var currentCity, currentCityId;

                    if (location_city_code === 131) {
                        currentCity = "北京";
                        currentCityId = 1;
                    } else if (location_city_code === 75 || location_city_code === 32) {
                        currentCity = "成都";
                        currentCityId = 2;
                        var CSH = "028-8774-8154"; // 成都客服
                    } else if (location_city_code === 29 || location_city_code === 179) {
                        currentCity = "杭州";
                        currentCityId = 3;
                    } else if (location_city_code === 8 || location_city_code === 288) {
                        currentCity = "济南";
                        currentCityId = 4;
                    } /*else if (location_city_code === 18 || location_city_code === 315) {
                        currentCity = "南京";
                        currentCityId = 5;
                    }*/
                    else {
                        currentCity = "北京";
                        currentCityId = 1;
                    }
                    //location_city_code === 9 || location_city_code === 53 //吉林省或者长春
                    //$scope.currentCity = currentCity;
                    that.chooseCity(currentCityId, currentCity);
                    return cityMessage = {cityId: currentCityId, city: currentCity}

                }
            })
        }

        this.getCurrentCity = function () {
            return $http.jsonp("http://api.map.baidu.com/location/ip?ak=1507703fda1fb9594c7e7199da8c41d8&coor=bd09ll&callback=JSON_CALLBACK")
                .success(function (data) {
                    return data;
                });
        };

        this.chooseCity = function (cityId, cityName) {
            window.localStorage.setItem("currentCity", JSON.stringify({"id": cityId, "name": cityName}));
        }

        this.getChosenCity = function () {
            return window.localStorage.getItem("currentCity") ? JSON.parse(window.localStorage.getItem("currentCity")) : null;
        }

        this.getCustomerCityId = function () {
            return ProfileService.getProfile().then(function (profile) {
                var cityId = 1;

                if (profile) {
                    if (profile.block) {
                        cityId = profile.block.city.id;
                    } else if (profile.zone) {
                        cityId = profile.zone.warehouse.city.id;
                    }
                }

                return cityId;
            })
        }
    });
