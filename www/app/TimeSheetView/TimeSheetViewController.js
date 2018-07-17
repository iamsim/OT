'use strict';

angular.module('officeTimerApp').controller('TimeSheetViewController', function($scope, $state, ionicToast, TimeSheetViewFactory, LoginFactory, $ionicPopup) {

    $scope.calendar = {};
    $scope.monthviewDisplayEventTemplateUrl = 'app/TimeSheetView/EventDetailTemplate.html';
    $scope.changeMode = function(mode) {
        $scope.calendar.mode = mode;
    };
    $scope.timeSheetSelectedTime = moment();

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

    $scope.onTimeSelected = function(selectedTime, events, disabled) {
        $scope.timeSheetSelectedTime = moment(selectedTime);
        $scope.getTimeSheetPeriod(moment(selectedTime).format("YYYY"), moment(selectedTime).format("MM"), moment(selectedTime).format("DD"));
        $scope.getTimeEntries(selectedTime);
    };

    $scope.$watch('calendar.currentDate', function(nv, ov) {
        TimeSheetViewFactory.timeSheetEntryDate = nv;
    });

    $scope.enterTimeSheet = function() {
        TimeSheetViewFactory.timeSheetEntryDate = $scope.calendar.currentDate;
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
                ionicToast.show(error, 'bottom', 2500, false);
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
                ionicToast.show(error, 'bottom', 2500, false);
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
                logged: false
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
                ionicToast.show(error, 'bottom', 2500, false);
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
                    $scope.totalHours = success.data.GetTimeEntriesByEmployeeIdAndDateRangeForTotalHoursResult;
                }
            }, function(error) {
                ionicToast.show(error, 'bottom', 2500, false);
            });
    };

    $scope.entrySelected = function(te) {
        TimeSheetViewFactory.selectedTimeEntry = te;
        $state.go('timeSheetEntry');
    };

    $scope.submit = function() {
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
                            ionicToast.show('Timesheet submitted successfully', 'bottom', 2500, false);
                            $scope.getTimeSheetPeriod($scope.timeSheetSelectedTime.format("YYYY"), $scope.timeSheetSelectedTime.format("MM"), $scope.timeSheetSelectedTime.format("DD"));
                        }
                    }, function(error) {
                        ionicToast.show(error, 'bottom', 2500, false);
                    });
            } else {
                console.log('You are not sure');
            }
        });
    };

    $scope.getTimeSheetPeriod($scope.timeSheetSelectedTime.format("YYYY"), $scope.timeSheetSelectedTime.format("MM"), $scope.timeSheetSelectedTime.format("DD"));
    $scope.getTimeEntries($scope.calendar.currentDate);
});