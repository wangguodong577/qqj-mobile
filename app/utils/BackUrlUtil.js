angular.module('cgwy')
    .factory('BackUrlUtil', function ($ionicHistory,$timeout) {
	    var service = {};

		//保存页面返回URL
		service.setBackUrl = function (backUrl) {
			service.backUrl = backUrl;
		}

		//获取页面URL
		service.getBackUrl = function () {
			return service.backUrl;
		}

		//保存页面参数
		service.setParamers = function (paramers) {
			service.paramers = paramers;
		}

		service.getParamers = function (){
			return service.paramers;
		}


		//销毁数据
		service.destory = function (){
			service.backUrl = null;
		}

		service.destoryParamers = function() {
			service.paramers = null;
		}
  
    return service;
});
