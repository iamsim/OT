'use strict';

angular.module('officeTimerApp').controller('LoginController', function($scope, $state, LoginFactory, ionicToast) {

    $scope.loginData = {
        URL: "",
        Username: "",
        Password: ""
    };

    $scope.errorMessage = null;

    $scope.login = function() {
        if ($scope.loginData.Username == "" || $scope.loginData.Password == "") {
            ionicToast.show("Please enter username and password", 'bottom', false, 2500);
        } else {
            $scope.errorMessage = "Login successful";
            $state.go('timeSheetView');
        }
    };

});