'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state, $ionicPopup, $timeout, ionicTimePicker, ionicToast, TimeSheetEntryFactory, TimeSheetViewFactory) {

    $scope.newTimesheetEntry = {
        IsBillable: false
    };

    $scope.timesheetPreferences = null;

    $scope.selected = {
        clientId: null,
        projectId: null,
        taskId: null,
        costCenterId: null,
        workTypeId: null,
        isBillable: false,
        totalHours: "0:0",
        date: TimeSheetViewFactory.timeSheetEntryDate,
        timeSheetEntry: angular.copy(TimeSheetViewFactory.selectedTimeEntry)
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

    $scope.clients = [];
    $scope.projects = [];
    $scope.tasks = [];
    $scope.workTypes = [];
    $scope.costCenters = [];

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

    function fillTimeLog(timeLogString) {
        var returnArray = [];
        var individualEntries = timeLogString.split('+');
        for (var i = 0; i < individualEntries.length; i++) {
            var timeEntries = individualEntries[i].split('-');
            returnArray.push({
                Start: timeEntries[0],
                Stop: timeEntries[1],
                Duration: timeEntries[2],
            })
        }
        return returnArray;
    }

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
            cssClass: 'timer-popup',
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
        if ($scope.selected.project == null) {
            ionicToast.show("Please select a project", 'bottom', false, 2500);
        } else if ($scope.selected.task == null) {
            ionicToast.show("Please select a task", 'bottom', false, 2500);
        } else if ($scope.timesheetPreferences.ShowWorkTypeInTimeSheet == 'true' && $scope.selected.workType == null) {
            ionicToast.show("Please select a work type", 'bottom', false, 2500);
        } else {
            var obj = {
                YearWS: moment($scope.selected.date).format("YYYY"),
                MonthWS: moment($scope.selected.date).format("MM"),
                DayWS: moment($scope.selected.date).format("DD"),
                AccountProjectId: $scope.selected.project.ProjectID,
                AccountProjectTaskId: $scope.selected.task.TaskID,
                TotalTime: $scope.selected.totalHours,
                Description: "",
                WorkType: $scope.selected.workType.AccountWorkTypeId,
                TimeLog: parseTimeLog(),
                CostCenter: 0,
                IsBillable: $scope.selected.isBillable
            };
            TimeSheetEntryFactory.addTimeEntry(obj)
                .then(function(success) {
                    if (success.status == 500) {
                        ionicToast.show(success.data, 'bottom', false, 2500)
                    } else {
                        ionicToast.show('Time entry added successfully!', 'bottom', false, 2500);
                        history.back();
                    }
                }, function(error) {
                    ionicToast.show(error, 'bottom', false, 2500);
                });
        }
    };

    $scope.addLoggedTime = function() {
        if ($scope.timepicked.Duration.indexOf('-') != -1) {
            ionicToast.show("Duration cannot be in negative value", 'bottom', false, 2500);
        } else if ($scope.timepicked.Duration != "0:0") {
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
        if (operation == 'add') {
            $scope.selected.totalHours = addTimes($scope.selected.totalHours, obj.Duration);
        } else {
            $scope.selected.totalHours = subTimes($scope.selected.totalHours, obj.Duration);
        }
    };

    $scope.getTimesheetPreferences = function() {
        TimeSheetEntryFactory.getTimeSheetPreferences()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.timesheetPreferences = success.data.results[0];
                    if ($scope.selected.timeSheetEntry != null) {
                        TimeSheetViewFactory.selectedTimeEntry = null;
                        //fill values
                        $scope.selected.client = null;
                        $scope.selected.project = null;
                        $scope.selected.task = null;
                        $scope.selected.costCenter = null;
                        $scope.selected.workType = null;
                        $scope.selected.isBillable = $scope.selected.timeSheetEntry.IsBillable;
                        $scope.selected.totalHours = moment($scope.selected.timeSheetEntry.TotalTime).format("hh:mm");
                        $scope.loggedInTimes = ($scope.selected.timeSheetEntry.TimeLog == "") ? [] : fillTimeLog($scope.selected.timeSheetEntry.TimeLog);
                    }
                    if ($scope.timesheetPreferences.ShowClientInTimesheet == 'true') {
                        $scope.getAssignedClients();
                    } else {
                        $scope.getAssignedProjects()
                    }
                    if ($scope.timesheetPreferences.ShowWorkTypeInTimeSheet == 'true') {
                        $scope.getWorkType();
                    }
                    if ($scope.timesheetPreferences.ShowCostCenterInTimeSheet == 'true') {
                        $scope.getCostCenter();
                    }
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getAssignedClients = function() {
        TimeSheetEntryFactory.getAssignedClients()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.clients = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getAssignedProjects = function() {
        TimeSheetEntryFactory.getAssignedProjects()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.projects = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getAssignedProjectsByClients = function(clientId) {
        var obj = {
            ClientId: clientId
        }
        TimeSheetEntryFactory.getAssignedProjectsByClients(obj)
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.projects = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getAssignedTasks = function(projectId) {
        var obj = {
            AccountProjectId: projectId
        }
        TimeSheetEntryFactory.getAssignedTasks(obj)
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.tasks = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getWorkType = function() {
        TimeSheetEntryFactory.getWorkType()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.workTypes = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getCostCenter = function() {
        TimeSheetEntryFactory.getCostCenter()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.costCenters = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    function timeToMins(time) {
        var b = time.split(':');
        return b[0] * 60 + +b[1];
    }

    function timeFromMins(mins) {
        function z(n) { return (n < 10 ? '0' : '') + n; }
        var h = (mins / 60 | 0) % 24;
        var m = mins % 60;
        return z(h) + ':' + z(m);
    }

    function addTimes(t0, t1) {
        return timeFromMins(timeToMins(t0) + timeToMins(t1));
    }

    function subTimes(t0, t1) {
        return timeFromMins(timeToMins(t0) - timeToMins(t1));
    }

    function parseTimeLog() {
        var finalString = "";
        for (var i = 0; i < $scope.loggedInTimes.length; i++) {
            var start = moment($scope.loggedInTimes[i].Start).format("hh:mm");
            var stop = moment($scope.loggedInTimes[i].Stop).format("hh:mm");
            finalString += start + '-' + stop + '-' + $scope.loggedInTimes[i].Duration;
            if (i != ($scope.loggedInTimes.length - 1)) {
                finalString += '+';
            }
        }
        return finalString;
    }

    $scope.getTimesheetPreferences();
});