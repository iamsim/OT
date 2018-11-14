'use strict';

angular.module('officeTimerApp').controller('TimeSheetEntryController', function($scope, $state, $ionicPopup, $timeout, ionicTimePicker, ionicToast, TimeSheetEntryFactory, TimeSheetViewFactory, $ionicHistory) {

    $scope.selected = {
        clientId: null,
        projectId: null,
        taskId: null,
        costCenterId: -1,
        workTypeId: -1,
        isBillable: false,
        totalHours: "0:0",
        date: TimeSheetViewFactory.timeSheetEntryDate,
        timeSheetEntry: angular.copy(TimeSheetViewFactory.selectedTimeEntry),
        description: ""
    };

    $scope.timesheetPreferences = TimeSheetViewFactory.timesheetPreferences;
    $scope.enableManualEntry = false;

    $scope.newTimesheetEntry = {
        IsBillable: false
    };

    $scope.isEdit = false;

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

    //duration-picker
    $scope.durationPicker = {
        minutes: 0
    };

    $scope.durationConfig = {
        inputButtonType: 'button-custom button-outline button-small',
        popupTitle: 'Work Duration',
        popupSubTitle: 'How long did you work?',
        popupSaveLabel: 'Save',
        popupSaveButtonType: 'button-outline button-custom',
        popupCancelLabel: 'Discard',
        popupCancelButtonType: 'button-outline button-assertive'
    };

    var ipObj1, ipObj2;

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
        ipObj1 = {
            inputTime: ((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60),
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    $scope.timepicked.Start.setHours(selectedTime.getUTCHours());
                    $scope.timepicked.Start.setMinutes(selectedTime.getUTCMinutes());
                }
            },
            format: 24, //Optional
            step: 1,
            setLabel: 'Set' //Optional
        };
        ionicTimePicker.openTimePicker(ipObj1);
    };

    $scope.pickEndTime = function() {
        ipObj2 = {
            inputTime: ((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60),
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
                    if (parseInt(duration.asHours()) < 0 || (parseInt(duration.asMinutes()) % 60) < 0) {
                        ionicToast.show("Duration cannot be in negative value", 'bottom', false, 3500);
                        $scope.timepicked.Duration = "0:0";
                    } else {
                        $scope.timepicked.Duration = parseInt(duration.asHours()) + ":" + (parseInt(duration.asMinutes()) % 60);
                    }
                }
            },
            format: 24, //Optional
            step: 1,
            setLabel: 'Set' //Optional
        };
        ionicTimePicker.openTimePicker(ipObj2);
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
            if ($scope.selected.totalHours != "0:0") {
                $scope.selected.totalHours = "0:0";
                $scope.durationPicker.minutes = 0;
            }
            $scope.timerState = 'running';
            $scope.$broadcast('timer-start');
            $scope.currentRunningTime.Start = new Date();
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
            $scope.currentRunningTime.Stop = new Date();
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
        if ($scope.selected.projectId == null) {
            ionicToast.show("Please select a project", 'bottom', false, 3500);
        } else if ($scope.selected.taskId == null) {
            ionicToast.show("Please select a task", 'bottom', false, 3500);
        } else if ($scope.timesheetPreferences.ShowWorkTypeInTimeSheet == 'true' && $scope.selected.workTypeId == null) {
            ionicToast.show("Please select a work type", 'bottom', false, 3500);
        } else if ($scope.selected.totalHours == "0:0" || $scope.selected.totalHours == "00:00") {
            ionicToast.show("Please enter your working hours", 'bottom', false, 3500);
        } else {
            var obj = {
                YearWS: moment($scope.selected.date).format("YYYY"),
                MonthWS: moment($scope.selected.date).format("MM"),
                DayWS: moment($scope.selected.date).format("DD"),
                AccountProjectId: $scope.selected.projectId,
                AccountProjectTaskId: $scope.selected.taskId,
                TotalTime: $scope.selected.totalHours,
                WorkType: $scope.selected.workTypeId,
                TimeLog: parseTimeLog(),
                CostCenter: $scope.selected.costCenterId,
                IsBillable: $scope.selected.isBillable,
                Description: $scope.selected.description
            };
            if ($scope.isEdit) {
                obj.AccountEmployeeTimeEntryId = $scope.selected.timeSheetEntry.AccountEmployeeTimeEntryId;
                TimeSheetEntryFactory.updateTimeEntry(obj)
                    .then(function(success) {
                        if (success.status == 500) {
                            ionicToast.show(success.data, 'bottom', false, 3500)
                        } else {
                            ionicToast.show('Time entry updated successfully!', 'bottom', false, 3500);
                            history.back();
                        }
                    }, function(error) {
                        ionicToast.show(error, 'bottom', false, 3500);
                    });
            } else {
                TimeSheetEntryFactory.addTimeEntry(obj)
                    .then(function(success) {
                        if (success.status == 500) {
                            ionicToast.show(success.data, 'bottom', false, 3500)
                        } else {
                            ionicToast.show('Time entry added successfully!', 'bottom', false, 3500);
                            history.back();
                        }
                    }, function(error) {
                        ionicToast.show(error, 'bottom', false, 3500);
                    });
            }
        }
    };

    $scope.addLoggedTime = function() {
        if ($scope.timepicked.Duration.indexOf('-') != -1) {
            ionicToast.show("Duration cannot be in negative value", 'bottom', false, 3500);
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
            ionicToast.show("Please choose different times", 'bottom', false, 3500);
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

    $scope.getAssignedClients = function() {
        if (!$scope.isEdit) {
            $scope.clients = [];
            $scope.projects = [];
            $scope.tasks = [];
            $scope.selected.projectId = null;
            $scope.selected.taskId = null;
        }
        TimeSheetEntryFactory.getAssignedClients()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 3500)
                } else {
                    $scope.clients = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 3500);
            });
    };

    $scope.getAssignedProjects = function() {
        if (!$scope.isEdit) {
            $scope.projects = [];
            $scope.tasks = [];
            $scope.selected.taskId = null;
        }
        TimeSheetEntryFactory.getAssignedProjects()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 3500)
                } else {
                    $scope.projects = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 3500);
            });
    };

    $scope.getAssignedProjectsByClients = function(clientId) {
        if (!$scope.isEdit) {
            $scope.projects = [];
            $scope.tasks = [];
            $scope.selected.projectId = null;
            $scope.selected.taskId = null;
        }
        if (clientId != null) {
            var obj = {
                ClientId: clientId
            }
            TimeSheetEntryFactory.getAssignedProjectsByClients(obj)
                .then(function(success) {
                    if (success.status == 500) {
                        ionicToast.show(success.data, 'bottom', false, 3500)
                    } else {
                        $scope.projects = success.data.results;
                    }
                }, function(error) {
                    ionicToast.show(error, 'bottom', false, 3500);
                });
        }
    };

    $scope.getAssignedTasks = function(projectId) {
        if (!$scope.isEdit) {
            $scope.tasks = [];
            $scope.selected.taskId = null;
        }
        if (projectId != null) {
            var obj = {
                AccountProjectId: projectId
            }
            TimeSheetEntryFactory.getAssignedTasks(obj)
                .then(function(success) {
                    if (success.status == 500) {
                        ionicToast.show(success.data, 'bottom', false, 3500)
                    } else {
                        $scope.tasks = success.data.results;
                    }
                }, function(error) {
                    ionicToast.show(error, 'bottom', false, 3500);
                });
        }
    };

    $scope.getWorkType = function() {
        $scope.workTypes = [];
        TimeSheetEntryFactory.getWorkType()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 3500)
                } else {
                    $scope.workTypes = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 3500);
            });
    };

    $scope.getCostCenter = function() {
        $scope.costcenters = [];
        TimeSheetEntryFactory.getCostCenter()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 3500)
                } else {
                    $scope.costCenters = success.data.results;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 3500);
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
            if (typeof($scope.loggedInTimes[i].Start) == "string") {
                var start = $scope.loggedInTimes[i].Start;
                var stop = $scope.loggedInTimes[i].Stop;
            } else {
                var start = moment($scope.loggedInTimes[i].Start).format("hh:mm");
                var stop = moment($scope.loggedInTimes[i].Stop).format("hh:mm");
            }
            finalString += start + '-' + stop + '-' + $scope.loggedInTimes[i].Duration;
            if (i != ($scope.loggedInTimes.length - 1)) {
                finalString += '+';
            }
        }
        return finalString;
    }

    if ($scope.selected.timeSheetEntry != null) {
        $scope.isEdit = true;
        TimeSheetViewFactory.selectedTimeEntry = null;
        //fill values
        $scope.selected.clientId = $scope.selected.timeSheetEntry.ClientId;
        $scope.selected.projectId = $scope.selected.timeSheetEntry.ProjectId;
        $scope.selected.taskId = $scope.selected.timeSheetEntry.TaskId;
        $scope.selected.costCenterId = $scope.selected.timeSheetEntry.CostCenterId;
        $scope.selected.workTypeId = $scope.selected.timeSheetEntry.WorkTypeId;
        $scope.selected.isBillable = $scope.selected.timeSheetEntry.IsBillable;
        $scope.selected.description = $scope.selected.timeSheetEntry.Description;
        $scope.selected.totalHours = moment($scope.selected.timeSheetEntry.TotalTime).format("HH:mm");
        $scope.loggedInTimes = ($scope.selected.timeSheetEntry.TimeLog == "") ? [] : fillTimeLog($scope.selected.timeSheetEntry.TimeLog);
        $scope.getAssignedProjectsByClients($scope.selected.clientId);
        $scope.getAssignedTasks($scope.selected.projectId);
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

    $scope.$watch(function() {
        return $scope.durationPicker.minutes;
    }, function(newValue, oldValue) {
        if (newValue != 0) {
            var obj = {
                Start: null,
                Stop: null,
                Duration: null
            };
            var h = parseInt(newValue / 60);
            var m = parseInt(newValue % 60);
            if (h > 24 || m > 60) {
                ionicToast.show('Hours cannot be more than 24. Minutes cannot be more than 60.', 'bottom', false, 3500);
                $scope.durationPicker.minutes = oldValue;
            } else {
                obj.Duration = h + ":" + m;
                //clear existing timelog
                $scope.loggedInTimes = [];
                $scope.selected.totalHours = "0:0";
                //disable manual entry
                $scope.enableManualEntry = false;
                //add picked duration
                $scope.calculateTotalHours(obj, 'add');
            }
        }
    });

    $scope.customBack = function(event) {
        if ($scope.selected.clientId != null ||
            $scope.selected.projectId != null ||
            $scope.selected.taskId != null ||
            $scope.selected.totalHours != "0:0") {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Attention',
                template: 'You have unsaved data in this entry. If you choose to go back, your changes will be discarded. Are you sure you want to go back?'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    console.log('You are sure');
                    $ionicHistory.goBack();
                } else {
                    console.log('You are not sure');
                }
            });
        } else {
            $ionicHistory.goBack();
        }
    };

    $scope.toggleManualEntry = function() {
        $scope.enableManualEntry = !$scope.enableManualEntry;
        if ($scope.enableManualEntry == true) {
            ionicToast.show('Please select your Start and End Eime and then tap on Add', 'bottom', false, 3500);
        }
    };
});