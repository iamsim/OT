'use strict';

angular.module('officeTimerApp').controller('LoginController', function($scope, $state, LoginFactory, ionicToast) {

    $scope.loginData = {
        base_url: "https://next.officetimer.com",
        username: "kalyan713@co.com123",
        password: "welcome1#"
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
                    }
                }, function(error) {
                    ionicToast.show(error, 'bottom', false, 2500);
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
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getAccountEmployeeId = function() {
        LoginFactory.getAccountEmployeeId($scope.loginData)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $state.go('home');
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

});