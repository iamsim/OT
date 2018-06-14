'use strict';

angular.module('officeTimerApp').factory("LoginFactory", function($q, $http) {
    var factory = {
        isAuthenticated: false,
        isLoggedIn: false,
        loggedInUser: null
    };

    var website = 'http://198.38.93.22';
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
            localStorage.setItem("Username", loginData.username);
            localStorage.setItem("Password", loginData.password);
        }
        localStorage.setItem("isLoggedIn", factory.isLoggedIn);
    }

    factory.removeLoginSession = function() {
        factory.isLoggedIn = false;
        localStorage.setItem("Username", loginData.username);
        localStorage.setItem("Password", loginData.password);
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