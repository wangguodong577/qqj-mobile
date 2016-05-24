angular.module('cgwy')
    .factory('CategoryService', function ($http, $q, apiConfig,ProfileService,LocationService) {

        var service = {};

        function getCategory() {
            var cityMessage = LocationService.getChosenCity();
            if(cityMessage){
                var cityId = cityMessage.id;
            }else{
                LocationService.getCurrentCity().then(function(){
                     return cityId = LocationService.locationCity().cityId;
                })
            }
            return $http({
                url: apiConfig.host + "/api/v2/new/category?cityId="+cityId,
                method: 'GET'
            }).then(function (payload) {
                var level1Categories = []
                var level2Categories = []
                var level3Categories = []
                angular.forEach(payload.data, function (value) {
                    level1Categories.push(value);

                    angular.forEach(value.children, function (value) {
                        level2Categories.push(value);

                        angular.forEach(value.children, function (value) {
                            level3Categories.push(value);
                        })
                    })
                })

                var categories = level1Categories.concat(level2Categories).concat(level3Categories);

                return {
                    categories: categories,
                    level1Categories: level1Categories,
                    level2Categories: level2Categories,
                    level3Categories: level3Categories
                };
            });
        }


        var promise  = getCategory();

        function getCategoryPromise() {
            return promise.then(function(data) {
                return promise ;
            }, function() {
                promise = getCategory();
                return promise;
            })
        }

        service.updateCategory = function(){
            promise  = getCategory();
        }

        service.getCategory = function (id) {
            return getCategoryPromise().then(function (data) {
                var categories = data.categories;
                for (var i = 0; i < categories.length; i++) {
                    var value = categories[i];
                    if (value.id == id) {
                        return value;
                    }
                }

                return null;
            })
        }

        service.getLevel = function (id) {
            return getCategoryPromise().then(function (data) {
                var level = 0;

                data.level1Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 1;
                    }
                })

                data.level2Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 2;
                    }
                })

                data.level3Categories.forEach(function(c) {
                    if(c.id == id) {
                        level = 3;
                    }
                })

                return level;
            })
        }


        service.getParentCategory = function (id) {
            return getCategoryPromise().then(function (data) {
                var categories = data.categories;
                for (var i = 0; i < categories.length; i++) {
                    var value = categories[i];

                    for(var j=0; j<value.children.length; j++) {
                        if (value.children[j].id == id) {
                            return value;
                        }
                    }
                }

                return null;
            })
        }


        service.getAllSubCategory = function (id) {
            return service.getCategory(id).then(function(category) {
                if(category) {
                    var array = [];
                    service.pushSubCategoryToArray(category, array);
                    return array;
                }
                else {
                    return [];
                }
            });
        }

        service.pushSubCategoryToArray = function(category, array) {
            array.push(category);
            if(category.children) {
                category.children.forEach(function(c) {
                    service.pushSubCategoryToArray(c, array);
                })
            }

        }

        service.getLevel2Categories = function () {
            return getCategoryPromise().then(function (data) {
                return data.level2Categories;
            });
        }
        service.getLevel1Categories = function () {
            return getCategoryPromise().then(function (data) {
                return data.level1Categories;
            });
        }
        return service;
    })
