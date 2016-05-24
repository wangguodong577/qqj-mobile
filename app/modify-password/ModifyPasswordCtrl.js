angular.module('cgwy')
    .controller('ModifyPasswordCtrl', function ($scope, $state, ProfileService, AlertService, Analytics, WxReadyService, CartService, BackUrlUtil) {

        // 用户密码信息
        $scope.user = {
            username: '',
            password: '',
            newPassword: '',
            repeatPassword: ''
        };

        // 获取当前用户账户
        if (window.localStorage['cachedUsername']) {
            $scope.user.username = window.localStorage['cachedUsername'];
        } else {
            ProfileService.getProfile().then(function (profile) {
                $scope.user.username = profile.username;
            });
        }

    	$scope.modifyPassword = function (user) {

            if (user.password.length < 6 || user.password.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号原密码");
                return;
            }
            if (user.newPassword.length < 6 || user.newPassword.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号新密码");
                return;
            }
            if (user.repeatPassword.length < 6 || user.repeatPassword.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号确认密码");
                return;
            }
            if (user.newPassword != user.repeatPassword) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }

            ProfileService.modifyPassword($scope.user.username,$scope.user.password, $scope.user.newPassword).then(function (res) {
                var msg = "";
                switch (res){
                    case 1:
                        msg = "密码修改成功";
                        break;
                    case 2:
                        msg = "密码修改失败";
                        break;
                    case 3:
                        msg = "原密码错误";
                        break;
                    default :
                        msg = "密码修改失败";
                }


                //修改成功 , 登出
                AlertService.alertMsg(msg).then(function () {
                    if(res == 1) {
                        Analytics.trackEvent('profile', 'logout');
                        ProfileService.logout().then(function() {
                            BackUrlUtil.setBackUrl("main.home"); //设置后退路径
                            CartService.resetCart();
                            $scope.profile = null;
                            WxReadyService.wxOnMenuShare();
                            $state.go("login");
                        });
                    }
                });

            });
        };
    });