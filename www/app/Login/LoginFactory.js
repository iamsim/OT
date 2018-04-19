'use strict';

angular.module('officeTimerApp').factory("LoginFactory", function() {
    var factory = {};

    var website = 'url goes here';
    var URL = website;

    factory.getBaseUrl = function() {
        return website;
    };

    return factory;
});