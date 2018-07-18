'use strict';

angular.module('officeTimerApp').factory("TimeSheetEntryFactory", function($q, $http, LoginFactory) {
    var factory = {};

    var URL = LoginFactory.getBaseUrl();

    factory.getTimeSheetPreferences = function() {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetTimesheetPreferencesByAccount',
            data: {},
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAssignedClients = function() {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAssignedClients',
            data: {},
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAssignedProjects = function() {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAssignedProjects',
            data: {},
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getCostCenter = function() {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetCostCenter',
            data: {},
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getWorkType = function() {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetWorkType',
            data: {},
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAssignedProjectsByClients = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAssignedProjectsFilterByClients',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAssignedTasks = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAssignedTasksForMobile',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.addTimeEntry = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/AddTimeEntryAdvanced',
            data: obj,
            headers: LoginFactory.headers
        }).then(function(success) {
            d.resolve(success);
        }, function(error) {
            d.reject(error);
        });
        return d.promise;
    };

    factory.updateTimeEntry = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/UpdateTimeEntryAdvanced',
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