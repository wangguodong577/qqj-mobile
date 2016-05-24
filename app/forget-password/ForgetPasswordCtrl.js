angular.module('cgwy')
    .controller('ForgetPasswordCtrl', function ($scope, $state, $interval, ProfileService, AlertService) {
        $scope.codeChecked = false;

        $scope.form = {
            telephone: '',
            code: '',
            password: '',
            repeatPassword: ''
        }

        $scope.codeStatus = "获取验证码";
        $scope.buttonDisabled = false;
        $scope.codeTime = 60; 
        $scope.askCode = function (telephone) {
            if (telephone === "") {
                AlertService.alertMsg("请输入手机号");
                return;
            }
            if (telephone.length != 11) {
                AlertService.alertMsg("请输入规范的手机号");
                return;
            }
            
            ProfileService.askCode(telephone);

            var timer = setInterval(function(){
                $scope.codeTime--;
                $scope.codeStatus = $scope.codeTime + "秒后失效";
                $scope.buttonDisabled = true;

                if($scope.codeTime == 0){
                    $scope.codeStatus = '获取验证码';
                    $scope.buttonDisabled = false;
                    $scope.codeTime = 60; 
                    clearInterval(timer);
                } 

                $scope.$apply();
            }, 1000); 
        }

        $scope.checkCode = function (telephone, code) {
            if (telephone === "") {
                AlertService.alertMsg("请填写手机号");
                return;
            }
            if (telephone.length != 11) {
                AlertService.alertMsg("请输入规范的手机号");
                return;
            }
            if (code === "") {
                AlertService.alertMsg("请输入验证码");
                return;
            }

            ProfileService.checkCode(telephone, code).then(function (checked) {
                $scope.codeChecked = checked;
                if(!checked) {
                    AlertService.alertMsg("验证码错误");
                }

            }, function(data) {
                AlertService.alertMsg(data.errmsg);
            });
        }

        $scope.resetPassword = function (telephone, code, password, repeatPassword) {
            if (password === "") {
                AlertService.alertMsg("请填写新密码");
                return;
            }
            if (password.length < 6 || password.length > 12) {
                AlertService.alertMsg("请填写6-12位英文/数字/符号密码");
                return;
            }
            if (repeatPassword === "") {
                AlertService.alertMsg("请确定新密码");
                return;
            }
            if (password != repeatPassword) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }

            ProfileService.resetPassword(telephone, code, password).then(function () {
                AlertService.alertMsg("密码重置成功").then(function() {
                    $state.go('login');
                });
            });

            // TODO info of failure
        }
    })
