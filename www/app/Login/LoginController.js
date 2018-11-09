'use strict';

angular.module('officeTimerApp').controller('LoginController', function($scope, $state, LoginFactory, ionicToast) {

    $scope.loginData = {
        base_url: "https://next.officetimer.com",
        username: "demoofficetimer111@gmail.com",
        password: "welcome1#"
    };
    $scope.enableURL = true;
    $scope.enablePassword = true;

    $scope.errorMessage = null;

    // cordova.getAppVersion.getVersionNumber(function(version) {
    //     $scope.appVersion = version;
    // });

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

    if (localStorage.getItem("isLoggedIn")) {
        $scope.loginData.username = localStorage.getItem("username");
        $scope.loginData.password = localStorage.getItem("password");
        $scope.loginData.base_url = localStorage.getItem("base_url");
        $scope.login();
    }

    $scope.toggleURL = function() {
        $scope.enableURL = !$scope.enableURL;
    };

    $scope.togglePassword = function() {
        $scope.enablePassword = !$scope.enablePassword;
    };

});