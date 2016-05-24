angular.module('cgwy')
    .controller('ShareCtrl', function ($scope, $state, ProfileService,WxReadyService,LocationService) {

    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;

            if (!profile) {
                $state.go("login");
            } else if (profile.id) {
                $scope.sharerId = profile.id;

                if (LocationService.getChosenCity()) {
                    $scope.currentCityId = LocationService.getChosenCity().id;
                }

                // 分享至微信－文案配置项
                $scope.title = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还有20元！";
                $scope.description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
                $scope.imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
                $scope.webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + $scope.sharerId;
				//$scope.webpageUrl = encodeURIComponent("http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId="+$scope.sharerId);
                $scope.webpageUrlEncode = encodeURIComponent($scope.webpageUrl);
                // WxReadyService.isWeChat(function () {
                //     var shareData = {
                //         title: $scope.title,
                //         desc: $scope.description,
                //         link: $scope.webpageUrl,
                //         imgUrl: $scope.imgUrl
                //     };
                //     wx.showAllNonBaseMenuItem();
                //     wx.onMenuShareAppMessage(shareData);
                //     wx.onMenuShareTimeline(shareData);
                //     wx.onMenuShareQQ(shareData);
                //     wx.onMenuShareQZone(shareData);
                // });
                // 分享至微信好友
                $scope.toWeChatFriends = function () {
                    if (window.device) {
                        // 微信开放平台－open
                        Wechat.share({
                            message: {
                                title: $scope.title,
                                description: $scope.description,
                                thumb: $scope.imgUrl,
                                mediaTagName: "",
                                messageExt: "",
                                media: {
                                    type: Wechat.Type.LINK,
                                    webpageUrl: $scope.webpageUrl
                                }
                            },
                            scene: Wechat.Scene.SESSION
                        }, function () {

                        }, function (reason) {
                            console.log("Failed: " + reason);
                        });
                    } else {
                        // 微信公众平台－mp
                        // wx.onMenuShareAppMessage({
                        //     title: $scope.title,
                        //     desc: $scope.description,
                        //     link: $scope.webpageUrl,
                        //     imgUrl: $scope.imgUrl,
                        //     type: 'link',
                        //     dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        //     success: function (res) {
                        //         // 用户确认分享后执行的回调函数
                        //         alert(res+"ok");
                        //     },
                        //     cancel: function () {
                        //         // 用户取消分享后执行的回调函数
                        //     }
                        // });
                        fxGuidePage.style.display = "block";
                    }
                }

                // 分享至微信朋友圈
                $scope.toWeChatTimeline = function () {
                    if (window.device) {
                        Wechat.share({
                            message: {
                                title: $scope.title,
                                description: "",
                                thumb: $scope.imgUrl,
                                mediaTagName: "",
                                messageExt: "",
                                media: {
                                    type: Wechat.Type.LINK,
                                    webpageUrl: $scope.webpageUrl
                                }
                            },
                            scene: Wechat.Scene.TIMELINE
                        }, function () {

                        }, function (reason) {
                            console.log("Failed: " + reason);
                        });
                    } else {
                        fxGuidePage.style.display = "block";
                        // wx.onMenuShareTimeline({
                        //     title: $scope.title,
                        //     link: $scope.webpageUrl,
                        //     imgUrl: $scope.imgUrl,
                        //     success: function () {
                        //         // 用户确认分享后执行的回调函数
                        //     },
                        //     cancel: function () {
                        //         // 用户取消分享后执行的回调函数
                        //     }
                        // });
                    }
                }
            }
        });
        var fxGuidePage = document.getElementById('fxGuidePage'),
            hideBtn = document.getElementById('hideBtn');
        $scope.fxGuidePageFun = function(){
            hideBtn.onclick = function(){
                fxGuidePage.style.display = "none";
            }
        }
        $scope.fxGuidePageFun();

        // 分享至短信
    	$scope.toSendMessage = function () {
            var message = "都知道在餐馆无忧食材便宜，哪知道分享给朋友还能赚钱！http://www.canguanwuyou.cn/www/#/share-page?sharerId=" + $scope.sharerId;
            var ua = navigator.userAgent.toLowerCase();
            var url;
        
            if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1 
                || (ua.indexOf('Safari') != -1 && ua.indexOf('Chrome') == -1))
                url = "sms:&body=" + encodeURIComponent(message);
            else
                url = "sms:?body=" + encodeURIComponent(message);

            window.location.href = url;
    	}


    });