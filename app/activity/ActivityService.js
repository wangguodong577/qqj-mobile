angular.module('cgwy')
    .factory('ActivityService', function ($http, $q, apiConfig, $state, LocationService) {
        var service = {};

        service.banners = [];
        service.welcomeContent = null;
        service.shoppingTip = null;
        service.cityId = null;

        service.reloadActivities = function() {
			return service.reloadActivitiesByCityId(null);
        }
        
        //扩充根据城市ID查询活动数据 by linsen 2015.9.18
        //当用户不登录的时候以cityId为准,登录后以用户注册地为准
		service.reloadActivitiesByCityId = function(cityId){
			var url = apiConfig.host + "/api/v2/banner";
        	if(cityId != undefined)
        		url += "?cityId=" + cityId;
        		
        	return $http.get(url).then(function(payload) {
                if(payload.data.banner) {
                    service.banners = payload.data.banner;
                } else {
                    service.banners = [];
                }

                service.welcomeContent = payload.data.welcomeContent;
                service.shoppingTip = payload.data.shoppingTip;
                return payload.data;
            })
        }

        return service;
});
