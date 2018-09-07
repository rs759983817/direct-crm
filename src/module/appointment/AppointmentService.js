/**
 * Created by beryl jiang on 2017/8/8.
 */

(function () {
    'use strict';
    angular.module('xrmApp')
        .factory('AppointmentService', ['rt', function (rt) {
            function _getAppointmentList(queryValue, pageIndex, pageSize) {
                var apiUrl = "api/appointment/GetAppointmentList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
                return rt.get(apiUrl);
            }

            function _getAppointmentInfo(id) {
                var apiUrl = "api/appointment/GetAppointmentInfo?id=" + id;
                return rt.get(apiUrl);
            }

            function _saveAppointment(model) {
                var apiUrl = "api/appointment/SaveAppointment";
                return rt.post(apiUrl, model);
            }

            return {
                getAppointmentList: _getAppointmentList,
                getAppointmentInfo: _getAppointmentInfo,
                saveAppointment: _saveAppointment
            };
        }]);
})();