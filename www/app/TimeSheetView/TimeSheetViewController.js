'use strict';

angular.module('officeTimerApp').controller('TimeSheetViewController', function($scope, $state, ionicToast, TimeSheetViewFactory, LoginFactory, $ionicPopup, TimeSheetEntryFactory) {

    $scope.calendar = {};
    $scope.calendar.currentDate = TimeSheetViewFactory.currentDate;
    $scope.monthviewDisplayEventTemplateUrl = 'app/TimeSheetView/EventDetailTemplate.html';
    $scope.changeMode = function(mode) {
        $scope.calendar.mode = mode;
    };
    $scope.timeSheetSelectedTime = moment();
    $scope.timesheetPreferences = null;

    $scope.weekNumber = parseInt(new Date().getDate() / 7) + 1;
    $scope.currentWeek = null;

    $scope.totalHours = null;

    $scope.onEventSelected = function(event) {
        console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
    };

    $scope.onViewTitleChanged = function(title) {
        $scope.viewTitle = title;
    };

    $scope.today = function() {
        $scope.calendar.currentDate = new Date();
    };

    $scope.isToday = function() {
        var today = new Date(),
            currentCalendarDate = new Date($scope.calendar.currentDate);

        today.setHours(0, 0, 0, 0);
        currentCalendarDate.setHours(0, 0, 0, 0);
        return today.getTime() === currentCalendarDate.getTime();
    };

    $scope.$watch('calendar.currentDate', function(newTime, oldTime) {
        TimeSheetViewFactory.timeSheetEntryDate = newTime;
        $scope.timeSheetSelectedTime = moment(newTime);
        $scope.getTimeSheetPeriod(moment(newTime).format("YYYY"), moment(newTime).format("MM"), moment(newTime).format("DD"));
        $scope.getTimeEntries(newTime);
    });

    $scope.enterTimeSheet = function() {
        TimeSheetViewFactory.timeSheetEntryDate = $scope.calendar.currentDate;
        TimeSheetViewFactory.currentDate = $scope.calendar.currentDate;
        $state.go('timeSheetEntry');
    };

    $scope.calendar.eventSource = [];

    $scope.getTimeSheetPeriod = function(year, month, day) {
        var obj = {
            YearWS: year,
            MonthWS: month,
            DayWS: day
        };
        TimeSheetViewFactory.getTimeSheetPeriod(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $scope.timesheetPeriod = success.data.results[0];
                    $scope.currentWeek = moment($scope.timesheetPeriod.StartDate).format("DD MMM") + ' - ' + moment($scope.timesheetPeriod.EndDate).format("DD MMM, YYYY")
                    $scope.getTimesheetWorkingDaysWithHours(obj);
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getTimesheetWorkingDaysWithHours = function(obj) {
        TimeSheetViewFactory.getTimesheetWorkingDaysWithHours(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $scope.timesheetWorkingDaysWithHours = success.data.results;
                    $scope.markTimeSheetOnCalendar();
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.markTimeSheetOnCalendar = function() {
        var events = [];
        var daysWithHours = angular.copy($scope.timesheetWorkingDaysWithHours);
        for (var i = 0; i < daysWithHours.length; i++) {
            events.push({
                title: daysWithHours[i].TotalHours,
                startTime: moment(new Date(daysWithHours[i].TimeEntryDate)).add(1, 'days'),
                endTime: moment(new Date(daysWithHours[i].TimeEntryDate)).add(1, 'days'),
                allDay: true,
                status: $scope.timesheetPeriod.TimesheetStatus
            });
        }
        $scope.calendar.eventSource = events;
    };

    $scope.getTimeEntries = function(selectedTime) {
        var obj = {
            StartDate: moment(selectedTime).format("YYYY-MM-DD"),
            EndDate: moment(selectedTime).format("YYYY-MM-DD")
        }
        TimeSheetViewFactory.getTimeEntries(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $scope.timeEntries = success.data.results;
                    if ($scope.timeEntries.length > 0) {
                        $scope.getTotalHours(obj);
                    }
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getTotalHours = function(obj) {
        obj.AccountEmployeeId = LoginFactory.GetAccountEmployeeIdForMobileResult;
        TimeSheetViewFactory.getTotalHours(obj)
            .then(function(success) {
                if (success.status == 500) {
                    $scope.errorMessage = success.data;
                } else {
                    $scope.errorMessage = null;
                    $scope.totalHours = success.data.GetTimeEntriesByEmployeeIdAndDateRangeForTotalHoursAdvancedResult;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.entrySelected = function(te) {
        TimeSheetViewFactory.selectedTimeEntry = te;
        TimeSheetViewFactory.currentDate = $scope.calendar.currentDate;
        $state.go('timeSheetEntry');
    };

    $scope.submit = function() {
        if ($scope.timeEntries.length == 0) {
            ionicToast.show('Cannot submit an empty Timesheet. Add some time entries before submitting!', 'bottom', false, 2500);
        } else {
            var hoursPerWeek = 0;
            for (var i = 0; i < $scope.timesheetWorkingDaysWithHours.length; i++) {
                var hours = parseInt($scope.timesheetWorkingDaysWithHours[i].TotalHours.split(":")[0]);
                if (hours < parseInt($scope.timesheetPreferences.MinimumHoursPerDay) || hours > parseInt($scope.timesheetPreferences.MaximumHoursPerDay)) {
                    var message = 'Daily working hours cannot be less than ' + $scope.timesheetPreferences.MinimumHoursPerDay + ' hours or more than ' + $scope.timesheetPreferences.MaximumHoursPerDay + ' hours';
                    ionicToast.show(message, 'bottom', false, 2500);
                } else {
                    hoursPerWeek += hours;
                }
            }
            if (hoursPerWeek < parseInt($scope.timesheetPreferences.MinimumHoursPerWeek) || hoursPerWeek > parseInt($scope.timesheetPreferences.MaximumHoursPerWeek)) {
                var message = 'Weekly working hours cannot be less than ' + $scope.timesheetPreferences.MinimumHoursPerWeek + ' hours or more than ' + $scope.timesheetPreferences.MaximumHoursPerWeek + ' hours';
                ionicToast.show(message, 'bottom', false, 2500);
            } else {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Submit Times',
                    template: 'Are you sure you want to submit?'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        var obj = {
                            AccountEmployeeTimeEntryPeriodId: $scope.timesheetPeriod.TimesheetPeriodId
                        }
                        TimeSheetViewFactory.submitTimeSheet(obj)
                            .then(function(success) {
                                if (success.status == 500) {
                                    $scope.errorMessage = success.data;
                                } else {
                                    $scope.errorMessage = null;
                                    ionicToast.show('Timesheet submitted successfully', 'bottom', false, 2500);
                                    $scope.getTimeSheetPeriod($scope.timeSheetSelectedTime.format("YYYY"), $scope.timeSheetSelectedTime.format("MM"), $scope.timeSheetSelectedTime.format("DD"));
                                }
                            }, function(error) {
                                ionicToast.show(error, 'bottom', false, 2500);
                            });
                    } else {
                        console.log('You are not sure');
                    }
                });
            }
        }
    };

    $scope.getTimesheetPreferences = function() {
        TimeSheetEntryFactory.getTimeSheetPreferences()
            .then(function(success) {
                if (success.status == 500) {
                    ionicToast.show(success.data, 'bottom', false, 2500)
                } else {
                    $scope.timesheetPreferences = success.data.results[0];
                    TimeSheetViewFactory.timesheetPreferences = success.data.results[0];
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', false, 2500);
            });
    };

    $scope.getTimeSheetPeriod($scope.timeSheetSelectedTime.format("YYYY"), $scope.timeSheetSelectedTime.format("MM"), $scope.timeSheetSelectedTime.format("DD"));
    $scope.getTimeEntries($scope.calendar.currentDate);
    $scope.getTimesheetPreferences();
});