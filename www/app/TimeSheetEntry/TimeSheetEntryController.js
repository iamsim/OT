'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state, $ionicPopup, $timeout, ionicTimePicker, ionicToast) {

    $scope.selected = {
        client: null,
        project: null,
        task: null,
        totalHours: 0
    };

    $scope.currentRunningTime = {
        Start: null,
        Stop: null,
        Duration: null
    };

    $scope.timepicked = {
        Start: new Date(),
        Stop: new Date(),
        Duration: "0:0"
    };

    $scope.loggedInTimes = [];

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

    $scope.timerState = 'stopped';

    var ipObj1 = {
        callback: function(val) { //Mandatory
            if (typeof(val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var selectedTime = new Date(val * 1000);
                $scope.timepicked.Start.setHours(selectedTime.getUTCHours());
                $scope.timepicked.Start.setMinutes(selectedTime.getUTCMinutes());
            }
        },
        format: 12, //Optional
        step: 1,
        setLabel: 'Set' //Optional
    };

    var ipObj2 = {
        callback: function(val) { //Mandatory
            if (typeof(val) === 'undefined') {
                console.log('Time not selected');
            } else {
                var selectedTime = new Date(val * 1000);
                $scope.timepicked.Stop.setHours(selectedTime.getUTCHours());
                $scope.timepicked.Stop.setMinutes(selectedTime.getUTCMinutes());
                var start = moment($scope.timepicked.Start);
                var end = moment($scope.timepicked.Stop);
                var duration = moment.duration(end.diff(start));
                $scope.timepicked.Duration = parseInt(duration.asHours()) + ":" + (parseInt(duration.asMinutes()) % 60);
            }
        },
        format: 12, //Optional
        step: 1,
        setLabel: 'Set' //Optional
    };

    $scope.pickStartTime = function() {
        ionicTimePicker.openTimePicker(ipObj1);
    };

    $scope.pickEndTime = function() {
        if ($scope.timepicked.StartHours == 0) {
            ionicToast.show("Please select start time first", 'bottom', false, 2500);
        } else {
            ionicTimePicker.openTimePicker(ipObj2);
        }
    };

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
            $scope.timerState = 'running';
            $scope.$broadcast('timer-start');
            $scope.currentRunningTime.Start = moment().format("hh:mm");
        }, 100);
    };

    $scope.pauseTimer = function() {
        $scope.timerState = 'paused';
        $scope.$broadcast('timer-stop');
        $scope.buttonArray.splice(0, 1);
        $scope.buttonArray.splice(0, 0, $scope.resumeButton);
    };

    $scope.resumeTimer = function() {
        $scope.timerState = 'running';
        $scope.$broadcast('timer-resume');
        $scope.buttonArray.splice(0, 1);
        $scope.buttonArray.splice(0, 0, $scope.pauseButton);
    };

    $scope.stopTimer = function() {
        $scope.timerState = 'stopped';
        $scope.$broadcast('timer-stop');
        $scope.buttonArray.splice(0, 1);
        $scope.buttonArray.splice(0, 0, $scope.pauseButton);
    };

    $scope.$on('timer-stopped', function(event, data) {
        if ($scope.timerState == 'stopped') {
            $scope.currentRunningTime.Stop = moment().format("hh:mm");
            $scope.currentRunningTime.Duration = data.hours + ":" + data.minutes;
            console.log($scope.currentRunningTime);
            $scope.loggedInTimes.push($scope.currentRunningTime);
            $scope.calculateTotalHours($scope.currentRunningTime, 'add');
            $scope.currentRunningTime = {
                Start: null,
                Stop: null,
                Duration: null
            };
        }
    });

    $scope.saveTimeSheet = function() {
        $state.go('timeSheetView');
    };

    $scope.addLoggedTime = function() {
        if ($scope.timepicked.Duration != "0:0") {
            var obj = angular.copy($scope.timepicked);
            $scope.loggedInTimes.push(obj);
            $scope.calculateTotalHours(obj, 'add');
            $scope.timepicked = {
                Start: new Date(),
                Stop: new Date(),
                Duration: "0:0"
            };
        } else {
            ionicToast.show("Please choose different times", 'bottom', false, 2500);
        }
    };

    $scope.deleteTime = function(index) {
        $scope.calculateTotalHours($scope.loggedInTimes[index], 'sub');
        $scope.loggedInTimes.splice(index, 1);
    };

    $scope.calculateTotalHours = function(obj, operation) {
        var hours = obj.Duration.slice(0, obj.Duration.indexOf(":"));
        var minutes = obj.Duration.split(":").pop();
        if (operation == 'add') {
            $scope.selected.totalHours = $scope.selected.totalHours + (parseInt(hours)) + (parseInt(minutes) / 60);
        } else {
            $scope.selected.totalHours = $scope.selected.totalHours - (parseInt(hours)) - (parseInt(minutes) / 60);
        }
    };
});