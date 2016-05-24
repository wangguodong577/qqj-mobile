angular.module('cgwy')
    .controller('CategoryCtrl', function ($scope, BackUrlUtil,CategoryService, $state, AlertService, Analytics) {
        CategoryService.updateCategory();
        CategoryService.getLevel1Categories().then(function (data) {
            $scope.categories = data;
            if(BackUrlUtil.getParamers()){
                $scope.selectedCategoryId = BackUrlUtil.getParamers();
                BackUrlUtil.destoryParamers();
            }else{
                $scope.selectedCategoryId = data[0].id;
            }

            if($scope.categories.length > 0) {
                $state.go("main.category.sub", {id:$scope.selectedCategoryId});
            }
        }, function() {
            AlertService.alertMsg("网络异常");
        })

        $scope.clickCategory = function(category) {
            $scope.selectedCategoryId = category.id;
            $state.go("main.category.sub",{id:category.id});
        }

    })