/* Created by chenpeng  on 2018/8/16. service
*/

(function () {
   'use strict';
   angular.module('xrmApp')
       .factory('PMpriceListService', ['rt', function (rt) {
           function _getPMpriceList(queryValue, pageIndex, pageSize) {
               var apiUrl = "api/PMpriceList/GetPMpriceList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
               return rt.get(apiUrl);
           }
         

           return {
               getPMpriceList: _getPMpriceList
               
           };
       }]);
})();
