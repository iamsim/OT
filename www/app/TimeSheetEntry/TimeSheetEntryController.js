'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state, $ionicPopup, $timeout) {

    $scope.selected = {
        client: null,
        project: null,
        task: null,
        totalHours: 3,
        duration: 0
    };

    $scope.loggedInTimes = [{
        Start: "01:20",
        Stop: "02:20",
        Duration: "1hr"
    }, {
        Start: "01:20",
        Stop: "02:20",
        Duration: "1hr"
    }, {
        Start: "01:20",
        Stop: "02:20",
        Duration: "1hr"
    }];

    $scope.pauseButton = {
        text: 'Pause',
        type: 'button-custom',
        onTap: function(e) {
            e.preventDefault();
            $scope.pauseTimer();
        }
    };
    $scope.resumeButton = {
        text: 'Resume',
        type: 'button-custom',
        onTap: function(e) {
            e.preventDefault();
            $scope.resumeTimer();
        }
    };
    $scope.stopButton = {
        text: 'Stop',
        type: 'button-custom',
        onTap: function(e) {
            return 'Stop';
        }
    }
    $scope.buttonArray = [$scope.pauseButton, $scope.stopButton];

    $scope.clients = [{
        Name: "ABC Software"
    }];

    $scope.projects = [{
        Name: "Time Management System"
    }];

    $scope.tasks = [{
        Name: "TMS-101 [refresh media]"
    }];

    $scope.durationConfig = {
        inputButtonType: 'button-custom button-outline',
        popupTitle: 'Task Duration',
        popupSubTitle: 'How long does it take you to finish this task?',
        popupSaveLabel: 'Set',
        popupSaveButtonType: 'button-outline button-custom',
        popupCancelLabel: 'Close',
        popupCancelButtonType: 'button-outline button-custom',
        minutesStep: 15,
        format: 'HH:MM:SS'
    };

    $scope.timerState = 'stopped';

    $scope.startTimer = function() {
        var myPopup = $ionicPopup.show({
            templateUrl: 'app/TimeSheetEntry/TimerTemplate.html',
            scope: $scope,
            buttons: $scope.buttonArray
        });

        myPopup.then(function(res) {
            if (res == 'Stop') {
                $scope.stopTimer();
            }
        });

        $timeout(function() {
            $scope.$broadcast('timer-start');
            $scope.timerState = 'running';
        }, 100);
    };

    $scope.pauseTimer = function() {
        $scope.$broadcast('timer-stop');
        $scope.timerState = 'paused';
        $scope.buttonArray.splice(0, 1);
        $scope.buttonArray.splice(0, 0, $scope.resumeButton);
    };

    $scope.resumeTimer = function() {
        $scope.$broadcast('timer-resume');
        $scope.timerState = 'running';
        $scope.buttonArray.splice(0, 1);
        $scope.buttonArray.splice(0, 0, $scope.pauseButton);
    };

    $scope.stopTimer = function() {
        $scope.$broadcast('timer-stop');
        $scope.timerState = 'stopped';
        console.log($scope.hours, $scope.minutes, $scope.seconds);
    };

    $scope.$on('timer-stopped', function(event, data) {
        $scope.selected.totalHours = parseFloat(data.hours + (data.minutes / 60) + (data.seconds / 3600));
    });

    $scope.saveTimeSheet = function() {
        $state.go('timeSheetView');
    };

    $scope.deleteTime = function(index) {
        $scope.loggedInTimes.splice(index, 1);
    };
});