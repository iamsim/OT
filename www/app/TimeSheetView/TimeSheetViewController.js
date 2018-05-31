'use strict';

angular.module('officeTimerApp').controller('TimeSheetViewController', function($scope, $state, ionicToast, TimeSheetViewFactory) {

    $scope.calendar = {};
    $scope.monthviewDisplayEventTemplateUrl = 'app/TimeSheetView/EventDetailTemplate.html';
    $scope.changeMode = function(mode) {
        $scope.calendar.mode = mode;
    };

    $scope.totalHours = 40;

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
        console.log('Selected time: ' + selectedTime + ', hasEvents: ' + (events !== undefined && events.length !== 0) + ', disabled: ' + disabled);
    };

    $scope.$watch('calendar.currentDate', function(nv, ov) {
        TimeSheetViewFactory.timeSheetEntryDate = nv;
    });

    $scope.enterTimeSheet = function() {
        $state.go('timeSheetEntry');
    };

    $scope.calendar.eventSource = [{
            title: '01-01',
            startTime: moment(),
            endTime: moment(),
            allDay: false
        },
        {
            title: '02-02',
            startTime: moment().add(1, 'days'),
            endTime: moment().add(1, 'days'),
            allDay: false
        },
        {
            title: '03-03',
            startTime: moment().add(2, 'days'),
            endTime: moment().add(2, 'days'),
            allDay: false
        }
    ];
});