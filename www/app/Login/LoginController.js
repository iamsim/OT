'use strict';

angular.module('officeTimerApp').controller('LoginController', function($scope, $state, LoginFactory, ionicToast) {

    $scope.loginData = {
        base_url: "https://",
        username: "",
        password: ""
    };

    $scope.errorMessage = null;

    $scope.login = function() {
        if ($scope.loginData.username == "" || $scope.loginData.password == "") {
            ionicToast.show("Please enter username and password", 'bottom', false, 2500);
        } else {
            LoginFactory.login($scope.loginData)
                .then(function(success) {
                    if (success.status == 500) {
                        $scope.errorMessage = success.data;
                    } else {
                        $scope.errorMessage = null;
                        LoginFactory.loginData = $scope.loginData;
                        $scope.getAccountId();
                        // $state.go('timeSheetView');
                    }
                }, function(error) {
                    ionicToast.show(error, 'bottom', 2500, false);
                });
        }
    };

    $scope.getAccountId = function() {
        LoginFactory.getAccountId($scope.loginData)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $scope.getAccountEmployeeId();
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getAccountEmployeeId = function() {
        LoginFactory.getAccountEmployeeId($scope.loginData)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $state.go('timeSheetView');
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

});