angular.module('cgwy')
    .controller('MapCtrl', function ($scope, $stateParams, $state, MapService,$ionicHistory) {
        $scope.near = false;
        $scope.locaitonClass = "tab-item active";
        $scope.nearClass = "tab-item";
		$scope.locationFontcolor = "color:#CA3A3A;";
		$scope.nearFontcolor = "";

        $scope.goBackView = function(){
			$ionicHistory.goBack();
    	}
    	
    	var reloadGeo = true;
 		var map = new BMap.Map("allmap");
 		if(MapService.isUsePointByCache()){
			map.centerAndZoom(MapService.getPoint(), 17);  //创建中心点,放大等级
 			map.setCenter(MapService.getPoint());
			initSearch();
 		}else{
 			var cityName = MapService.getViewModel().cityName == undefined ? "北京" : MapService.getViewModel().cityName;
	 		map.centerAndZoom(cityName, 15); //根据城市名称定位 
	 		initSearch();		
	 		map.addEventListener("tilesloaded",function(){
				//在地图页面只重新定位一次
				if(reloadGeo){
					reloadGeo = false;
	 			MapService.geolocation(geoCallback);
				function geoCallback(){
					if(MapService.getPointState() == 1){
						map.centerAndZoom(MapService.getPoint(), 17); 
						map.setCenter(MapService.getPoint());
						initSearch();
					}
				}
				}
	 		});
 		}
 		
 		map.addEventListener("dragend", function(){
			initSearch();
 		});
 				
 		var searchNearBounds = null;
 		var searchLocalBounds = null;
 		//----------- tab页左右侧查询 ---------------	
 		function initSearch(){
 			if(searchNearBounds == null)
	 			searchNearBounds = new BMap.LocalSearch(map, { onSearchComplete : searchNearComplete });
			if(searchLocalBounds == null)
				searchLocalBounds = new BMap.LocalSearch(map, { onSearchComplete : searchLocationComplete });
			searchLocal();
 			searchNear();
 		}
		
 		
		//根据searchInBounds 查询条件数量来决定返回的是Array[LocalResult]还是LocalResult
		function arrayToArray(result){
			var arrayObj = new Array(); //最终结果集
			for(var r = 0; r < result.length; r++){
				var pois = result[r];
				for(var p = 0; p < pois.getNumPois(); p++){
					var poiObj = pois.getPoi(p);
					if(typeof(poiObj) != "undefined")
						arrayObj.push(poiObj); //测试中发现曾经添加进去了 undefined,情况无法复现所以加次判断过滤
				}
			}
			return arrayObj;
		}
		
		
		function searchNearComplete(result){
			$scope.$apply(function(){
				$scope.pois = arrayToArray(result);
			})
		}

		function searchLocationComplete(result){
			$scope.$apply(function(){
				$scope.locals = arrayToArray(result);
			})
		}

		//根据地图现实区域查询餐馆(区域信息)
		function searchNear(){
			searchNearBounds.searchInBounds(["餐馆","酒店","小吃","饭店"], map.getBounds());
		}
	
		//根据地图中心点展示poi数据(位置信息)
		function searchLocal(){
			var geoc = new BMap.Geocoder(); 
			geoc.getLocation(map.getCenter(), function(rs){
				$scope.$apply(function(){
					if(rs.surroundingPois.length != 0)
						$scope.locals = rs.surroundingPois;
					else
						searchLocalBounds.searchInBounds(["街","路"], map.getBounds());
				})
			});
		}

        //tab点击事件
        $scope.clickTab = function(isNear){
            $scope.near = isNear;
            $scope.locaitonClass = isNear ? "tab-item" : "tab-item active";
			$scope.locationFontcolor = isNear ? "" : "color:#CA3A3A;";
            $scope.nearClass = isNear ? "tab-item active" : "tab-item";
			$scope.nearFontcolor = isNear ? "color:#CA3A3A;" : "";
        }

 		//点击列表时候回调(1:搜索关键字<AutocompleteResultPoi>  | 2:附近,location <LocalResultPoi>)
		$scope.clickItem = function(poi,type) {
			var result = "";
			var model = MapService.getViewModel();
			if(type === 1){
				//暂时没有该情况
				result = poi.city + poi.district + poi.business;
			}else if(type === 2){
				result = poi.title + "-" + poi.address;
				model.restaurantAddress = result;
				model.lat = map.getCenter().lat;
				model.lng = map.getCenter().lng;
			}
            $ionicHistory.goBack();
        }
})
