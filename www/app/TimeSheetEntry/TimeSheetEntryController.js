'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state, $ionicPopup, $timeout, ionicTimePicker, ionicToast, TimeSheetEntryFactory) {

    $scope.newTimesheetEntry = {
        IsBillable: false
    };

    $scope.timesheetPreferences = null;

    $scope.selected = {
        client: null,
        project: null,
        task: null,
        costCenter: null,
        workType: null,
        totalHours: "0:0"
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
        if ($scope.selected.project == null) {
            ionicToast.show("Please select a project", 'bottom', false, 2500);
        } else if ($scope.selected.task == null) {
            ionicToast.show("Please select a task", 'bottom', false, 2500);
        } else if ($scope.timesheetPreferences.ShowWorkTypeInTimeSheet == 'true' && $scope.selected.workType == null) {
            ionicToast.show("Please select a work type", 'bottom', false, 2500);
        } else if ($scope.timesheetPreferences.ShowCostCenterInTimeSheet == 'true' && $scope.selected.costCenter == null) {
            ionicToast.show("Please select a cost center", 'bottom', false, 2500);
        } else {
            var obj = {
                YearWS: moment(TimeSheetEntryFactory.timesheetEntryDate).format("YYYY"),
                MonthWS: moment(TimeSheetEntryFactory.timesheetEntryDate).format("MM"),
                DayWS: moment(TimeSheetEntryFactory.timesheetEntryDate).format("DD"),
                AccountProjectId: $scope.selected.project.ProjectID,
                AccountProjectTaskId: $scope.selected.task.TaskID,
                TotalTime: "00:00",
                Description: "",
                WorkType: $scope.selected.workType.WorkTypeID,
                CostCenter: $scope.selected.costCenter.CostCenterID,
                IsBillable: $scope.selected.IsBillable
            };
            console.log(obj);
        }
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
                    $scope.errorMessage = success.data;
                } else {
                    $scope.timesheetPreferences = success.data.results[0];
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
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getAssignedClients = function() {
        TimeSheetEntryFactory.getAssignedClients()
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.clients = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getAssignedProjects = function() {
        TimeSheetEntryFactory.getAssignedProjects()
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.projects = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getAssignedProjectsByClients = function(client) {
        var obj = {
            ClientId: client.Id
        }
        TimeSheetEntryFactory.getAssignedProjectsByClients(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.projects = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getAssignedTasks = function(project) {
        var obj = {
            AccountProjectId: project.ProjectID
        }
        TimeSheetEntryFactory.getAssignedTasks(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.tasks = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getWorkType = function() {
        TimeSheetEntryFactory.getWorkType()
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.workTypes = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.getCostCenter = function() {
        TimeSheetEntryFactory.getCostCenter()
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.costCenters = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
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

    $scope.getTimesheetPreferences();
});