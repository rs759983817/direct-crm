/**
 * Created by min on 2016/8/4.
 */
(function () {
    'use strict';
    angular.module('xrmApp')
        .factory('LookupService', ['rt', function (rt) {
            //客户lookup获取数据
            function _getAccountLookupList(queryValue, pageIndex, pageSize) {
                var url = "api/account/GetAccountLookupList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
                return rt.get(url);
            }

            //联系人lookup获取数据
            function _getContactLookupList(queryValue, pageIndex, pageSize) {
                var url = "api/contact/GetContactLookupList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
                return rt.get(url);
            }

            //客户lookup获取数据
            function _getOpportunityLookupList(queryValue, pageIndex, pageSize) {
                var url = "api/opportunity/GetOpportunityLookupList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
                return rt.get(url);
            }

            return {
                getAccountLookupList: _getAccountLookupList,
                getContactLookupList: _getContactLookupList,
                getOpportunityLookupList: _getOpportunityLookupList
            };
        }]);
})();