angular.module('cgwy')
    .controller('RestaurantDetailCtrl', function ($scope, $state, ProfileService, $stateParams, Analytics, AlertService, MapService,$ionicHistory) {

        $scope.goBackView = function(){
            MapService.delViewModel(); //清空地图Service中保留的ViewModel数据
            $ionicHistory.goBack();
        }

        $scope.restaurant = MapService.getViewModel();
        if($scope.restaurant == undefined) {
            $scope.restaurant = {
                name: '',
                receiver: '',
                telephone: '',
                restaurantAddress: '',
                lat: null,
                lng: null,
                restaurantStreetNumber: ''
            }
            ProfileService.getRestaurant($stateParams.id).then(function (data) {
                $scope.restaurant = data;
                $scope.restaurant.restaurantAddress = data.address.address;
                $scope.restaurant.restaurantStreetNumber = data.address.streeNumer;
                $scope.restaurant.lat = data.address.wgs84Point.latitude;
                $scope.restaurant.lng = data.address.wgs84Point.longitude;
            });
        }

        $scope.toMap = function() {
            $state.go('map',{});
            MapService.setViewModel($scope.restaurant);
        }


        $scope.updateRestaurant = function(restaurant) {
            if(restaurant.name === "") {
                AlertService.alertMsg("请填写餐馆名称");
                return;
            }
            if(restaurant.receiver === "") {
                AlertService.alertMsg("请填写收货人");
                return;
            }
            if(restaurant.telephone === "") { 
                AlertService.alertMsg("请填写手机号");
                return;
            }
            if(restaurant.telephone.length != 11) {
                AlertService.alertMsg("请填写规范号码");
                return;
            }

            ProfileService.updateRestaurant(restaurant).then(function(data) {
                MapService.delViewModel(); //清空地图Service中保留的ViewModel数据

                $scope.restaurant = data;

                $state.go('restaurant-list');
            },function(data) {
                console.log(data);
                AlertService.alertMsg(data.errmsg);
            });
        }
    })
