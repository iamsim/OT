'use strict';

angular.module('officeTimerApp').factory("TimeSheetViewFactory", function($q, $http, LoginFactory) {
    var factory = {
        timeSheetEntryDate: null,
        selectedTimeEntry: null,
        timesheetPreferences: null,
        currentDate: new Date()
    };

    var URL = LoginFactory.getBaseUrl();

    factory.getTimeSheetPeriod = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetTimesheetPeriod',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getTimesheetWorkingDaysWithHours = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetTimesheetWorkingDaysWithHours',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getTimeEntries = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetTimeEntriesByEmployeeIdAndDateRangeAdvanced',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getTotalHours = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetTimeEntriesByEmployeeIdAndDateRangeForTotalHoursAdvanced',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.submitTimeSheet = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/SubmitTimesheet',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    return factory;
});