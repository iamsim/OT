'use strict';

angular.module('officeTimerApp').factory("LoginFactory", function($q, $http) {
    var factory = {
        isAuthenticated: false,
        isLoggedIn: false,
        loginData: null,
        AuthenticateMobileUserResult: null,
        GetAccountIdForMobileResult: null,
        GetAccountEmployeeIdForMobileResult: null,
        headers: {
            'Content-Type': "application/json",
            'base_url': null,
            'AuthenticatedToken': null,
            'AccountId': null,
            'AccountEmployeeId': null
        }
    };

    var website = 'http://198.38.88.218:8080';
    var URL = website;

    factory.login = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/AuthenticateMobileUser',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.AuthenticateMobileUserResult = success.data.AuthenticateMobileUserResult;
            factory.storeLoginSession(obj);
            d.resolve(success);
        }, function(error) {
            factory.isAuthenticated = false;
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAccountId = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAccountIdForMobile',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.GetAccountIdForMobileResult = success.data.GetAccountIdForMobileResult;
            d.resolve(success);
        }, function(error) {
            factory.isAuthenticated = false;
            d.reject(error);
        });
        return d.promise;
    };

    factory.getAccountEmployeeId = function(obj) {
        var d = $q.defer();
        $http({
            method: 'POST',
            url: URL + '/GetAccountEmployeeIdForMobile',
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            factory.GetAccountEmployeeIdForMobileResult = success.data.GetAccountEmployeeIdForMobileResult;
            factory.headers.base_url = factory.loginData.base_url;
            factory.headers.AuthenticatedToken = factory.AuthenticateMobileUserResult;
            factory.headers.AccountId = factory.GetAccountIdForMobileResult;
            factory.headers.AccountEmployeeId = factory.GetAccountEmployeeIdForMobileResult;
            d.resolve(success);
        }, function(error) {
            factory.isAuthenticated = false;
            d.reject(error);
        });
        return d.promise;
    };

    factory.storeLoginSession = function(loginData) {
        factory.isLoggedIn = true;
        if (loginData != undefined) {
            localStorage.setItem("username", loginData.username);
            localStorage.setItem("password", loginData.password);
            localStorage.setItem("base_url", loginData.base_url);
        }
        localStorage.setItem("isLoggedIn", factory.isLoggedIn);
    }

    factory.removeLoginSession = function() {
        factory.isLoggedIn = false;
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("base_url");
        localStorage.removeItem("isLoggedIn");
    };

    factory.logout = function() {
        factory.isAuthenticated = false;
        factory.removeLoginSession();
    };

    factory.getBaseUrl = function() {
        return website;
    };

    return factory;
});