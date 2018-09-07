/**
 * Created by min on 2018/1/25.
 */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('appointment-list', {
                url: '/appointment/list',
                templateUrl: 'module/appointment/AppointmentListView.html',
                controller: 'AppointmentListController'
            })
            .state('appointment-edit', {
                url: '/appointment/edit/:id',
                templateUrl: 'module/appointment/AppointmentEditView.html',
                controller: 'AppointmentEditController'
            });
        $urlRouterProvider.otherwise("/");
    }
]);