angular.module('cgwy')
    .controller('couponEditCtrl', function ($scope,$state,AlertService, $stateParams,ProfileService) { 
    	$scope.couponInfo = [];
        $scope.couponInfo = ProfileService.getCouponInfo();
        // $scope.couponInfo.forEach(function(couponItem){
        // 	couponItem.chosen=false;
        // })
        $scope.back = function(){
        	$state.go("confirm");
        }
        $scope.toggle = function(couponItem){
        	
        	if ($scope.couponInfo) {
        		$scope.couponInfo.forEach(function(value) {
        			if (value != couponItem) {
        				value.chosen = false;
        			};
        		})
        	};

        }
        $scope.submitCoupon = function (){

        	var couponId = null;

        	$scope.couponInfo.forEach(function(couponItem){
        		if( couponItem.chosen == true ){
        			couponId = couponItem.id;
        		}
        	})
        	if( couponId != null ){
        		$state.go("confirm",{
	        		"cId":couponId
	        	});
        	} else {
        		AlertService.alertMsg("请选择优惠券");
        	}
        }
        
    });