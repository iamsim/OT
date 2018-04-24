'use strict';

angular.module('officeTimerApp').factory("TimeSheetViewFactory", function(LoginFactory) {
    var factory = {
        timeSheetEntryDate: null
    };

    var URL = LoginFactory.getBaseUrl() + '/secure';

    return factory;
});