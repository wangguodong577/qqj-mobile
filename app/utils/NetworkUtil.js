angular.module('cgwy')
    .factory('NetworkUtil', function () {
	    var service = {};

		/*
			states[Connection.UNKNOWN]  = 'Unknown connection';
			states[Connection.ETHERNET] = 'Ethernet connection';
			states[Connection.WIFI]     = 'WiFi connection';
			states[Connection.CELL_2G]  = 'Cell 2G connection';
			states[Connection.CELL_3G]  = 'Cell 3G connection';
			states[Connection.CELL_4G]  = 'Cell 4G connection';
			states[Connection.CELL]     = 'Cell generic connection';
			states[Connection.NONE]     = 'No network connection';
		*/

		service.getNetworkRs = function (){
			try{
				var networkState = navigator.connection.type;
				if(networkState === "wifi" || networkState === "ethernet" ||
					networkState === "3g" || networkState === "4g")
					return true;
				else
					return false;
			}catch(e){
				return false;
			}
		}

    return service;
});
