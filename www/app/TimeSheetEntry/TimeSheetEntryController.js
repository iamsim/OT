'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state) {

    $scope.saveTimeSheet = function() {
        $state.go('timeSheetView');
    };
});