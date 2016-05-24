angular.module('cgwy')
    .controller('FeedbackCtrl', function ($scope, $state, $ionicActionSheet, $ionicBackdrop , CameraService, FeedbackService, AlertService) {

        $scope.form = {};

        $scope.isCommitState = true;

        $scope.uploadFile = function () {
            $upload.upload({
                url: '/api/v2/media',
                method: 'POST',
                file: files[i]
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadProgress = ('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data) {
                $scope.mediaUrl = data.url;
                $scope.form.mediaFileId = data.id;
            })
        }

        $scope.upload = function (filePath) {
            if (ionic.Platform.isWebView()) {
                if(filePath) {
                    $ionicBackdrop.retain();
                    $scope.showLoading = true;
                    $scope.isCommitState = true;

                    CameraService.upload(filePath).then(function (file) {
                        console.log("upload feedback success");

                        $scope.showLoading = false;
                        $ionicBackdrop.release();
                        $scope.isCommitState = false;

                        FeedbackService.feedback($scope.form.content, file.id).then(function () {
                            AlertService.alertMsg("反馈成功，我们会尽快处理").then(function() {
                                $state.go("main.profile")
                            });
                        });

                    }, function (err) {
                        console.log(err);

                        $scope.showLoading = false;
                        $ionicBackdrop.release();
                        $scope.isCommitState = false;

                        AlertService.alertMsg("提交失败");
                        return;
                    })
                } else {
                    FeedbackService.feedback($scope.form.content).then(function () {
                        AlertService.alertMsg("反馈成功，我们会尽快处理").then(function() {
                            $state.go("main.profile")
                        });
                    })
                }
            }
        }

        $scope.addPicture = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [
                    {text: '从手机相册选择'},
                    {text: '拍照'}
                ],
                cancelText: '取消',
                cancel: function () {
                    return;
                },
                buttonClicked: function (index) {
                    if (index == 0) {
                        CameraService.getPicture({
                            quality: 75,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                        }).then(function (imageURI) {
                            $scope.lastPhoto = imageURI;
                        })

                        return true;
                    } else if (index == 1) {
                        CameraService.getPicture({
                            quality: 75,
                            targetWidth: 320,
                            targetHeight: 320,
                            saveToPhotoAlbum: false
                        }).then(function (imageURI) {
                            $scope.lastPhoto = imageURI;
                        })

                        return true;
                    }
                }
            });
        };

        $scope.$watch('lastPhoto', function(newValue) {
            if (newValue) {
                $scope.isCommitState = false;
            } else if (newValue === "" || newValue === null) {
                $scope.isCommitState = true;
            }
        });

        $scope.$watch('form.content', function(newValue) {
            if (newValue) {
                $scope.isCommitState = false;
            } else if (newValue === "" || newValue === null) {
                $scope.isCommitState = true;
            }
        });
    })
