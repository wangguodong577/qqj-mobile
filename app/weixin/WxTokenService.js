angular.module('cgwy')
    .factory('WxTokenService', function ($http, $q, apiConfig, $rootScope) {
        var service = {};
        service.getAccess_token = function (url) {
            /**
             * 微信推荐
             *  url从  http://www.canguanwuyou.cn/www/browser.html
             *  改变为 http://www.canguanwuyou.cn/www/browser.html?from=singlemessage&isappinstalled=0
             *  导致省生成微信 signature 不正确,无法正确使用微信sdk
             *  扩展url参数
             *  by linsen 2015.10.15
             * */
            var array = url.split("#");
            return  $http({
                url: "http://www.canguanwuyou.cn/wechat",
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: "url="+encodeURIComponent(array[0])
            }).then(function (wechatToken) {
                return wechatToken;
            });
        }
        // console.log(service.getAccess_token());
        return service;
    })