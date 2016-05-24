angular.module('cgwy')
    .controller('OrderEvaluateCtrl', function ($scope, $rootScope, $state, $stateParams, $cordovaToast, $ionicPopup, AlertService, OrderService) {

        $scope.hasEvaluated = false;

        $scope.data = {
            productCount: 0,
            deliveryCount: 0,
            trackerCount: 0
        }

        $scope.OrderEvaluateForm = {
            productQualityScore: 0,
            deliverySpeedScore: 0,
            trackerServiceScore: 0,
            msg: ''
        }
  
        $scope.$watch('data.productCount', function() {
            $scope.OrderEvaluateForm.productQualityScore = $scope.data.productCount * 2;
        });  

        $scope.$watch('data.deliveryCount', function() {
            $scope.OrderEvaluateForm.deliverySpeedScore = $scope.data.deliveryCount * 2;
        }); 

        $scope.$watch('data.trackerCount', function() {
            $scope.OrderEvaluateForm.trackerServiceScore = $scope.data.trackerCount * 2;
        }); 

        if ($stateParams.id && $stateParams.hasEvaluated == "true") {
            $scope.hasEvaluated = true;

            OrderService.getOrderEvaluation($stateParams.id).then(function (data) {
                // console.log(data);

                $scope.data.productCount = data.productQualityScore/2;
                $scope.data.deliveryCount = data.deliverySpeedScore/2;
                $scope.data.trackerCount = data.trackerServiceScore/2;

                $scope.OrderEvaluateForm.msg = data.msg;
            });
        }

        $scope.submitOrderEvaluation = function() {
          
            if($scope.OrderEvaluateForm.productQualityScore == 0 
                || $scope.OrderEvaluateForm.deliverySpeedScore == 0
                  || $scope.OrderEvaluateForm.trackerServiceScore == 0) {
                AlertService.alertMsg("请完成所有打分才能提交");
                return;
            }

            OrderService.submitOrderEvaluation($stateParams.id,$scope.OrderEvaluateForm).then(function (){
                var alertTemplate = $ionicPopup.alert({
                        template: '<center>评价成功</center>',
                        okText: '确定',
                        okType: 'button-light'
                    });
                alertTemplate.then(function () {
                    $state.go('main.order-list');
                })
            })
        }
    });

(function() {
  angular.module('ionic.rating', []).constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
  }).controller('RatingController', function($scope, $attrs, ratingConfig) {
    var ngModelCtrl;
    ngModelCtrl = {
      $setViewValue: angular.noop
    };
    this.init = function(ngModelCtrl_) {
      var max, ratingStates;
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;
      this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
      this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
      max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
      ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) : new Array(max);
      return $scope.range = this.buildTemplateObjects(ratingStates);
    };
    this.buildTemplateObjects = function(states) {
      var i, j, len, ref;
      ref = states.length;
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        states[i] = angular.extend({
          index: 1
        }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, states[i]);
      }
      return states;
    };
    $scope.rate = function(value) {
      if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
        ngModelCtrl.$setViewValue(value);
        return ngModelCtrl.$render();
      }
    };
    $scope.reset = function() {
      $scope.value = ngModelCtrl.$viewValue;
      return $scope.onLeave();
    };
    $scope.enter = function(value) {
      if (!$scope.readonly) {
        $scope.value = value;
      }
      return $scope.onHover({
        value: value
      });
    };
    $scope.onKeydown = function(evt) {
      if (/(37|38|39|40)/.test(evt.which)) {
        evt.preventDefault();
        evt.stopPropagation();
        return $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? {
          1: -1
        } : void 0));
      }
    };
    this.render = function() {
      return $scope.value = ngModelCtrl.$viewValue;
    };
    return this;
  }).directive('rating', function() {
    return {
      restrict: 'EA',
      require: ['rating', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      template: '<ul class="rating" ng-mouseleave="reset()" ng-keydown="onKeydown($event)">' + '<li ng-repeat="r in range track by $index" ng-click="rate($index + 1)"><i class="icon" ng-class="$index < value && (r.stateOn || \'ion-android-star\') || (r.stateOff || \'ion-android-star-outline\')"></i></li>' + '</ul>',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var ngModelCtrl, ratingCtrl;
        ratingCtrl = ctrls[0];
        ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          return ratingCtrl.init(ngModelCtrl);
        }
      }
    };
  });

}).call(this);
