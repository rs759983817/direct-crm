/**
 * Created by chenpeng on 2018/8/17.
 */
xrmApp.config([
    '$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('pmPriceList-list', {
                url: '/pmPriceList/list',
                templateUrl: 'module/pmPriceList/pmPriceListView.html',
                controller: 'PMpriceListController'
            });
           /* .state('pmPriceList-info', {
                url: 'h5.nbdeli.com/index2.html#Product/proinfo/:id',
                templateUrl: 'h5.nbdeli.com/index2.html',
                controller: 'PMpriceListController'
            });*/
        $urlRouterProvider.otherwise("/");
    }
]);