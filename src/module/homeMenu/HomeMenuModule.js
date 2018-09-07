/********************************************************
 Copyright @ 得力集团有限公司 All rights reserved.
 创建人   : chenpeng
 创建时间 : 2018/8/18.
 说明     : 主菜单页面Module
 *********************************************************/
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('home-main', {
                url: '/home/main',
                templateUrl: 'module/homeMenu/homeMenuView.html',
                controller: 'HomeMenuController'
            })
        ;
        $urlRouterProvider.otherwise("/");
    }]);