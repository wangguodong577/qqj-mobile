angular.module('cgwy')
    .factory('WxReadyService', function ($http, $q, apiConfig, $rootScope) {
        var service = {};

        service.wxConfig = function (callback) {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                // return true;
                return callback();
            } else {
                // console.log("config 1");
                return false;
            }
        }

        service.isWeChat = function (callback) {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {

                wx.ready(function () {
                    callback();
                });

                return true;
            } else {
                // console.log('isWeChat');
                return false;
            }
        }
        service.wxOnMenuShare = function (sharerId){
            var title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元！";
            var description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
            var imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
            var webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + sharerId;
            service.isWeChat(function () {
                var shareData = {
                    title: title,
                    desc: description,
                    link: webpageUrl,
                    imgUrl: imgUrl
                };
                wx.showAllNonBaseMenuItem();
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareQQ(shareData);
                wx.onMenuShareQZone(shareData);
            });
        }
        // console.log(service.getAccess_token());
        return service;
    })