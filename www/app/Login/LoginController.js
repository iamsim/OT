'use strict';

angular.module('officeTimerApp').controller('LoginController', function($scope, $state, LoginFactory, ionicToast) {

    $scope.loginData = {
        username: "",
        password: ""
    };

    $scope.errorMessage = null;

    $scope.login = function() {
        if ($scope.loginData.username == "" || $scope.loginData.password == "") {
            ionicToast.show("Please enter username and password", 'bottom', false, 2500);
        } else {
            // LoginFactory.login($scope.loginData)
            //     .then(function(success) {
            //         console.log(success);
            //     }, function(error) {
            //         console.log(error);
            //     });
            $state.go('timeSheetView');
        }
    };

});