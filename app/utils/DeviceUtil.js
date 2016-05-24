angular.module('cgwy')
    .factory('DeviceUtil', function () {
	    var service = {};
		service.deviceId = null;
		service.platform = null;
		service.status = 0; //0:无状态 | 1:成功 | 2:失败 | 3:plugin获取异常

		service.getDeviceId = function (){
			var devicePlugin = null;
			try{
				devicePlugin = cordova.plugins.DeviceId; //DeviceId
				devicePlugin.getDeviceId("",bdOnSuccess,bdOnError);
			}catch(e){
				console.log("DevicePlugin 获取异常 ---- cgwy.error");
				service.status = 3;
			}
		}

		var bdOnSuccess = function(entry){
			service.deviceId = entry.deviceid;
			service.platform = entry.platform;
			service.status = 1;
			console.log("DevicePlugin :" + service.deviceId);
			console.log("DevicePlugin :" + service.platform);
		}

		var bdOnError = function(error){
			service.status = 2;
		}
  
    return service;
});
