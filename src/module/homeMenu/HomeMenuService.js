/********************************************************
 Copyright @ 得力集团有限公司 All rights reserved.
 创建人   : chenpeng
 创建时间 : 2018/8/18.
 说明     : 主菜单页面Service
 *********************************************************/
/*global angular:false */
/*global xrmApp:false */
(function () {
    'use strict';
    angular.module('xrmApp')
        .factory('HomeMenuService', ['rt', function (rt) {
            /**
             * 获取微信菜单列表
             * @param id
             * @returns {*}
             */
            function _getWeChatMenuList(){
               // var apiUrl = "api/Common/GetWeChatMenuList";
               // return rt.get (apiUrl);
               return rt.get(null);
            }
            function _getHomeMenuList(queryValue, pageIndex, pageSize){
                var apiUrl = "api/appointment/GetAppointmentList?queryValue=" + encodeURIComponent(queryValue) + "&pageIndex=" + pageIndex + "&pageSize=" + 2;
                return rt.get(apiUrl);
            }

           

            return {
                getWeChatMenuList:  _getWeChatMenuList,
                getHomeMenuList: _getHomeMenuList,
                
            };
        }]);
})();