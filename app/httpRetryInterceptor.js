angular.module('cgwy').
    factory('httpResponseErrorInterceptor',function($q, $injector) {
    return {
        'responseError': function(response) {
            if(!response.config.retryCount) {
                response.config.retryCount = 0;
            }

            if (response.status === 0 && response.config.retryCount < 2) {
                response.config.retryCount ++;
                // should retry
                var $http = $injector.get('$http');
                return $http(response.config);
            }
            // give up
            return $q.reject(response);
        }
    };
});