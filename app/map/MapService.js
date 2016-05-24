angular.module('cgwy')
    .factory('MapService', function ($http, $q, apiConfig, $state, WxReadyService,$ionicPopup) {
	    var service = {};
	    service.pointTime = 0;
// 	    service.defPoint = new BMap.Point(116.40387397,39.91488908);
    
		//保存页面的Model
		service.setViewModel = function (viewModel) {
            service.viewModel = viewModel;
        }

		//获取页面Model
        service.getViewModel = function () {
            return service.viewModel;
        }
        
        //删除页面Model
        service.delViewModel = function (){
        	service.viewModel = null;
        } 
        
        
        //定位是否成功
        service.getPointState = function (){
        	return service.pointState;
        }
        
 //        //定位时间
//         service.getPointTime = function () {
//         	return service.pointTime;
//         }
        
        //定位的坐标
        service.getPoint = function () {
        	if(service.point == undefined){
//         		/return service.defPoint;
        		return new BMap.Point(116.40387397,39.91488908);
        	}
        	return service.point;
        }
        
        service.isUsePointByCache = function (){
        	var currtime = (new Date()).valueOf();
        	if(service.pointState == 1 && service.pointTime +  1800000 >  currtime){
        		return true;
        	}
        	return false;
        }
        
        /*
         * 获取定位坐标加入以下逻辑 :
         * 1:定位数据
         * 2:距离上一次定位时间超过30分钟
         */
        service.geolocation = function (callback){
        	if(service.isUsePointByCache()){
        		callback();
			}else{
				starGeoLocation(callback);
			}
        }
        
        var locationServiceObj = null;
        function starGeoLocation(callback){
        	if(!WxReadyService.isWeChat(function() {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
							retPoint(res.longitude, res.latitude,callback,true);
                        },
                        fail:function (err){
                        	retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
                        }
                    });
                })) {
                                
				try{
					locationServiceObj = cordova.plugins.LocationService; //安卓定位插件
				}catch(e){
					locationServiceObj = null;
				}
                //-----------------安卓地图定位------------------
				if(ionic.Platform.isAndroid() && window.cordova && locationServiceObj != null){
					var bdOnSuccess = function(entry){
						switch(entry.state_code){
							case 4:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;
							case 5:
								retPointError(callback,"暂时无法获取位置信息，请开启定位服务");
								break;
							default:
								retPoint(entry.lng, entry.lat,callback,false);
						}	
					}
					
					var bdOnError = function(error){ retPointError(callback);}
					//安卓地图定位
					cordova.plugins.LocationService.getLocationService("",bdOnSuccess,bdOnError);
				}else if (ionic.Platform.isIOS() && window.cordova && navigator.geolocation != undefined){
					//-----------------iOS地图定位------------------
					var onSuccess = function(position) {
						retPoint(position.coords.longitude, position.coords.latitude, callback,true);
					};

					var onError = function(error) {
						switch(error.code){
							case error.TIMEOUT:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;
							case error.PERMISSION_DENIED:
								retPointError(callback,"无法获取你的位置信息。请到手机系统的[设置]->[隐私]->[定位服务]中打开定位服务,并允许餐馆无忧使用定位服务。");
								break;
							case error.POSITION_UNAVAILABLE:
								retPointError(callback,"暂时无法获取位置信息，请检查网络重试");
								break;	
							default:
								retPointError(callback, "暂时无法获取位置信息，请检查网络重试");
											
						}
					}
					navigator.geolocation.getCurrentPosition(onSuccess, onError);
				}else{
					//-----------------普通地图定位------------------
					var geolocation = new BMap.Geolocation();
					geolocation.getCurrentPosition(function(r){
						if(this.getStatus() == BMAP_STATUS_SUCCESS)
							retPoint(r.point.lng, r.point.lat, callback ,false);
						else
							retPointError(callback);
							
					},{enableHighAccuracy: true})
				}
            }
        }
        
        
        /*
         *   longitude:经度
         *   latitude:纬度
         *	 callback:回调函数
         *   baiduconv: 是否需要百度坐标转换
         */
        function retPoint(longitude,latitude,callback,baiduconv){
        	service.pointState = 1; //成功
        	service.pointTime = (new Date()).valueOf();
        	if(baiduconv){
        		$http.jsonp('http://api.map.baidu.com/geoconv/v1/?callback=JSON_CALLBACK&ak=aGAtGnhqerwXBYrlntNMFt2i&coords=' + longitude + ',' + latitude).then(function (payload) {
					r = payload.data;
					var latitude = r.result[0].y; // 纬度，浮点数，范围为90 ~ -90
					var longitude = r.result[0].x; // 经度，浮点数，范围为180 ~ -180。
					service.point = new BMap.Point(longitude, latitude); //记录坐标
					service.pointState = 1; //成功
					
					if(callback != undefined) {
						callback();
					}

				})
        	}else{
        		//百度js定位如果定位失败返回坐标 locationServiceObj == null 在没有cordova plugin是才提示
				if(latitude == 39.91488908 && longitude == 116.40387397 && locationServiceObj == null){
					//service定位不提示Alert
					if(callback != null)
						showAlert("暂时无法获取位置信息，请检查定位服务是否开启");
					service.pointState = 2; //失败
				}
        		service.point = new BMap.Point(longitude, latitude); //记录坐标
	        	if(callback != undefined)
    	    		callback();
        	}
        }
                    
		//定位失败回调
        function retPointError(callback,msg){
        	showAlert(msg);
        	service.pointState = 2; //失败
	        if(callback != undefined)
    	    	callback();
        }
        
        //提示信息       
		var showAlert = function(msg) {
			var alertPopup = $ionicPopup.alert({
				template: "<div class='push'>位置服务</div><br><div class='push-body'>" + msg + "</div>",
				okText: '确定',
				okType: 'button-light'
			});
		};
		  
    return service;
});
