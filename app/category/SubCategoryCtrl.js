angular.module('cgwy')
    .controller('SubCategoryCtrl', function ($scope, CategoryService, $stateParams,Analytics,LocationService) {
        CategoryService.getCategory($stateParams.id).then(function (data) {
            $scope.id = $stateParams.id;
            $scope.categories = [];

            data.children.forEach(function (v) {
                $scope.categories.push(v);
            })


            //判断是不是特价商品,505代表特价商品，后台需求传递id = -1，用于查询特价商品
            if($scope.categories[0].id==505){
                $scope.categories[0].id=-1;
            }

            /*为分类加下划线*/
            $scope.categoriesOne = [];
            $scope.categoriesTwo = [];
            $scope.categoriesThree = [];
            $scope.categoriesFour = [];
            $scope.categoriesFive = [];
            $scope.categoriesSix = [];

            for (var i = 0; i < 4; i++) {
                $scope.categoriesOne.push($scope.categories[i]);
            }
            for (var i = 4; i < 8; i++) {
                $scope.categoriesTwo.push($scope.categories[i]);
            }
            for (var i = 8; i < 10; i++) {
                $scope.categoriesThree.push($scope.categories[i]);
            }
            for (var i = 10; i < 14; i++) {
                $scope.categoriesFour.push($scope.categories[i]);
            }
            for (var i = 14; i < 16; i++) {
                $scope.categoriesFive.push($scope.categories[i]);
            }
            for (var i = 16; i < $scope.categories.length; i++) {
                $scope.categoriesSix.push($scope.categories[i]);
            }

            //区别显示北京，成都调味油类的东西
            if(LocationService.getChosenCity().id == 1){
                $scope.cate = $scope.categoriesSix[1]
                $scope.categoriesSix[1] = $scope.categoriesSix[3];
                $scope.categoriesSix[3] = $scope.cate;
            }

        })
    })