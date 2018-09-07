/*global angular:false */
/*global _:false */
/*global xrmApp:false */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('dev-language', {
                url: '/dev/language',
                templateUrl: 'developer/language/languageView.html',
                controller: 'DeveloperLanguageController'
            });
    }]);
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('dev-login', {
                url: '/dev/login',
                templateUrl: 'developer/login/loginView.html',
                controller: 'DeveloperLoginController'
            });
    }]);
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
xrmApp.config([
    '$stateProvider', function($stateProvider) {
        'use strict';
        $stateProvider
            .state('dev-main', {
                url: '/dev/main',
                templateUrl: 'developer/main/mainView.html',
                controller: 'DeveloperMainController'
            })
            .state('dev-home', {
                url: '/dev/home',
                templateUrl: 'developer/main/homeView.html',
                controller: 'DeveloperHomeController'
            })
            .state('dev-application', {
                url: '/dev/application',
                templateUrl: 'developer/main/applicationView.html',
                controller: 'DeveloperApplicationController'
            })
            .state('dev-workspace', {
                url: '/dev/workspace',
                templateUrl: 'dev/main/workspaceView.html',
                controller: 'DeveloperWorkspaceController'
            });
    }]);
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            .state('dev-serveraddress', {
                url: '/dev/serveraddress',
                templateUrl: 'developer/serveraddress/serverAddressView.html',
                controller: 'DeveloperServerAddressController'
            });
    }]);