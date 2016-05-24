cordova.define("com.mishu.plugin.locationservice.LocationService", function(require, exports, module) { var exec = require('cordova/exec');

exports.getLocationService = function(arg0, success, error) {
    exec(success, error, "LocationService", "LocationService", [arg0]);
};



});
