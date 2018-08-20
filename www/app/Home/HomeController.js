'use strict';

angular.module('officeTimerApp').controller('HomeController', function($scope, $state, ionicToast, $ionicHistory) {

    $scope.timeTracking = function() {
        $state.go('timeSheetView');
    };

    $scope.others = function() {
        ionicToast.show('This feature will be out in the next release', 'bottom', false, 2500);
    };

    $scope.logout = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('login');
    }

});