'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state) {

    $scope.selected = {
        client: {
            Name: "ABC Software"
        },
        project: {
            Name: "Time Manangement System"
        },
        task: {
            Name: "TMS-101 [Refresh Media]"
        },
        totalHours: 4,
        duration: 0
    };

    $scope.durationConfig = {
        inputButtonType: 'button-positive button-outline',
        popupTitle: 'Task Duration',
        popupSubTitle: 'How long does it take you to finish this task?',
        popupSaveLabel: 'Set',
        popupSaveButtonType: 'button-outline button-positive',
        popupCancelLabel: 'Close',
        popupCancelButtonType: 'button-outline button-positive',
        minutesStep: 15,
        format: 'HH:MM:SS'
    };

    $scope.timerState = 'stopped';

    $scope.startTimer = function() {
        $scope.$broadcast('timer-start');
        $scope.timerState = 'running';
    };
    $scope.stopTimer = function() {
        $scope.$broadcast('timer-stop');
        $scope.timerState = 'stopped';
    };
    $scope.pauseTimer = function() {
        $scope.$broadcast('timer-stop');
        $scope.timerState = 'paused';
    };
    $scope.resumeTimer = function() {
        $scope.$broadcast('timer-resume');
        $scope.timerState = 'running';
    };

    $scope.saveTimeSheet = function() {
        $state.go('timeSheetView');
    };
});