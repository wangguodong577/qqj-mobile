angular.module('cgwy')
    .controller('MembershipPointCtrl', function ($scope, $ionicPopover, ProfileService, AlertService, MembershipPointService) {

        // 获取餐馆名称
    	if (window.sessionStorage['restaurantName']) {
    		$scope.restaurantName = window.sessionStorage['restaurantName'];
    	} else {
    		ProfileService.getRestaurants().then(function (data) {
	            if (data) {
	            	$scope.restaurantName = data[0].name;
	            	window.sessionStorage['restaurantName'] = data[0].name;
	            } else {
	            	AlertService.alertMsg("获取餐馆失败，请返回重试");
	            }
	        });
    	}

        // 获取积分信息
        MembershipPointService.getScore().then(function (data) {
            $scope.score = data;
            // console.log(data);

            if (data.totalScore == null && data.availableScore == null) {
                AlertService.alertMsg("暂无积分信息");
            }
        });

    	$ionicPopover.fromTemplateUrl('templates/pointSharePopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.pointSharePopover = popover;
        });

    	ProfileService.getProfile().then(function (profile) {
            $scope.profile = profile;
            $scope.sharerId = profile.id;

            // 积分分享－文案配置
            $scope.title = "都知道在餐馆无忧买食材便宜，哪知道分享给朋友还能赚积分！";
            $scope.description = "价格便宜品牌正，服务靠谱免配送，帮朋友省食材成本，你就是super壕！";
            $scope.imgUrl = "http://www.canguanwuyou.cn/www/img/logo_weixin_03.png";
            $scope.webpageUrl = "http://www.canguanwuyou.cn/www/browser.html#/share-page?sharerId=" + $scope.sharerId + "_score";
			
            $scope.webpageUrlEncode = encodeURIComponent($scope.webpageUrl);
           
            // 分享至微信好友
            $scope.toWeChatFriends = function () {
                if (window.device) {
                    // 微信开放平台
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
                        // console.log("Failed: " + reason);
                    });
                } else {
                    $scope.pointSharePopover.hide();

                    fxGuidePage.style.display = "block";
                }
            }

            // 分享至朋友圈
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
                        // console.log("Failed: " + reason);
                    });
                } else {
                    $scope.pointSharePopover.hide();
                    
                    fxGuidePage.style.display = "block";
                }
            }

            // 分享至短信
	    	$scope.toSendMessage = function () {
	            var message = "都知道餐馆无忧食材便宜，哪知道分享给朋友还能赚积分！http://www.canguanwuyou.cn/www/#/share-page?sharerId=" + $scope.sharerId + "_score";
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
 
        var fxGuidePage = document.getElementById('fxGuidePage');
        var hideBtn = document.getElementById('hideBtn');

        $scope.fxGuidePageFun = function() {
            hideBtn.onclick = function() {
                fxGuidePage.style.display = "none";
            }
        }

        $scope.fxGuidePageFun();

    });