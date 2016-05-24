angular.module('cgwy')
    .controller('RegisterCtrl', function ($ionicHistory,$scope, $state, $ionicPopup, $stateParams, ProfileService, LocationService, RestaurantService, Analytics, AlertService, MapService,DeviceUtil) {
    	$scope.goBackView = function(){
    		$ionicHistory.goBack();
    	}

        $scope.cities = [];
		
  		$scope.form = MapService.getViewModel();

  		if($scope.form == undefined){
			$scope.form = {
				telephone: '',
				password: '',
				repeatPassword: '',
				cityId: null,
				cityName: "北京",
				regionId: null,
				restaurantName: '',
				receiver: '',
                contact: '',
				restaurantAddress: '',
				restaurantStreetNumber: '',
				lat:null,
				lng:null
			};
  		}

		$scope.toMap = function() {
			$state.go('map',{});
			MapService.setViewModel($scope.form);
		}
	   
        if ($stateParams.sharerId) {
            $scope.form.sharerId = $stateParams.sharerId;
        }

        LocationService.getCities().then(function (cities) {
            $scope.cities = cities;

            if($scope.cities.length == 1) {
                $scope.form.cityId = $scope.cities[0].id;
                $scope.form.cityName = $scope.cities[0].name;
            } else {
            	//在首次进入注册页面,进行定位.从地图页面回跳不做定位处理直接回显
                if($scope.form.cityId == null && LocationService.getChosenCity()) {
                    $scope.form.cityId = LocationService.getChosenCity().id;
                    $scope.form.cityName = LocationService.getChosenCity().name;
                }
            }
            
            //页面数据回显控制
            selectRegion($scope.form.cityId);
        });

        $scope.checkUserName = function(username) {
            ProfileService.checkUserName(username).then(function() {}, function(error) {
                if(data.errmsg) {
                    AlertService.alertMsg(data.errmsg);
                }
            })
        }

        $scope.register = function(form) {
			
            if(form.telephone === "") {
                AlertService.alertMsg("请填写手机号");
                return;
            } 
            if(form.telephone.length != 11) {
                AlertService.alertMsg("请填写规范号码");
                return;
            }
            if(form.password === "") {
                AlertService.alertMsg("请填写密码");
                return;
            }
            if(form.password.length < 6 || form.password.length > 12) {
                AlertService.alertMsg("请设置6-12位英文/数字/符号密码");
                return;
            }
            if(form.repeatPassword === "") {
                AlertService.alertMsg("请确认密码");
                return;
            }
            if(form.repeatPassword != form.password) {
                AlertService.alertMsg("两次密码不同，请重新输入");
                return;
            }
            if(form.cityId == null) {
                AlertService.alertMsg("请选择您餐馆所在的城市");
                return;
            }
            if(form.restaurantName === "") {
                AlertService.alertMsg("请填写餐馆名称");
                return;
            }
            if(form.receiver === "") {
                AlertService.alertMsg("请填写收货人");
                return;
            }
            if(form.contact === "") {
                AlertService.alertMsg("请填写收货人电话");
                return;
            }
            if(form.restaurantAddress === "") {
                AlertService.alertMsg("请选择您的餐馆位置");
                return;
            }
            if(form.restaurantStreetNumber === "") {
                AlertService.alertMsg("请输入街道或门牌号等详细信息");
                return;
            }

            ProfileService.register(form).then(function(data) {
                Analytics.trackEvent('profile', 'register', 'success', 1);
				MapService.delViewModel(); //清空地图Service中保留的ViewModel数据

                if(DeviceUtil.status == 1){
                    ProfileService.bindDevice(DeviceUtil.platform,DeviceUtil.deviceId);
                }

                if ($stateParams.sharerId)
                    $state.go("regist-success",{sharerId:$stateParams.sharerId});
                else
                    $state.go("regist-success");
            }, function(data) {
                Analytics.trackEvent('profile', 'register', 'failure', 1);

                AlertService.alertMsg(data.errmsg);
            });
        }


      	$scope.$watch('form.cityId', selectRegion);
		function selectRegion (cityId){
            if($scope.cities) {
                for (var i = 0; i < $scope.cities.length; i++) {
                    var city = $scope.cities[i];
                    if (city.id == cityId) {
                        $scope.city = city;
                        $scope.form.cityName = city.name;
                    }
                }
            }
        }

    });
