/**
 * Created by beryl jiang on 2017/6/11.
 */
(function () {
    'use strict';
    function AccountLookupController($scope,$rootScope, $state, $ionicActionSheet,rt,LookupService) {
        $scope.pageIndex = 1;
        $scope.pageSize = rt.getPaginationSize();
        function _init() {
            $scope.vm = {};
            $scope.vm.KeyOrigin=1;
            $scope.vm.CurrentKeyOrigin=1;
            $scope.vm.queryValue = "";
            $scope.vm.viewRowDataList = [];

            $scope.search = _search;
            $scope.selectData = _selectData;
            $scope.removeValue = _removeValue;
            //下拉更多
            $scope.loadMoreClick = _loadMoreClick;
            //下拉刷新
            $scope.viewRefresh = _viewRefresh;
            rt.showLoadingToast("正在加载数据...");
            _loadData(function (data) {
                $scope.vm.viewRowDataList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }


        function _loadData(success, failure) {

            LookupService.getAccountLookupList($scope.vm.queryValue,$scope.pageIndex,$scope.pageSize)
                .success(function (data) {
                    if (success) {
                        success(data);
                    }
                    if (data.length < $scope.pageSize) {
                        $scope.isLoadMore = false;
                    }
                    else {
                        $scope.isLoadMore = true;
                    }
                })
                .error(function (error) {
                    if (failure) {
                        failure();
                    }
                    rt.showErrorToast(error);
                });
        }

        function _loadMoreData(){
            rt.showLoadingToast("正在加载数据...");
            $scope.pageIndex +=1;
            _loadData(function (data) {
                $scope.vm.viewRowDataList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        function _search(){
            rt.showLoadingToast("正在加载数据...");
            $scope.pageIndex = 1;
            _loadData(function (data) {
                $scope.vm.viewRowDataList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        function _selectData(u){
            $scope.closeDialog();
            if(rt.isFunction($scope.onDataSelected) && !rt.isNull(u)){
                u.keyOrigin=$scope.vm.CurrentKeyOrigin;
                $scope.onDataSelected(u);
            }
        }

        function _removeValue(user){
            $scope.closeDialog();
            $scope.onDataSelected(user);
        }

        function _loadMoreClick() {
            if (!$scope.isLoadMore) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return;
            }

            $scope.pageIndex += 1;
            _loadData(function (data) {
                $scope.vm.viewRowDataList.push.apply($scope.vm.viewRowDataList, data);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function () {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');

        }
        /**'
         * 下拉刷新
         * @private
         */
        function  _viewRefresh(){
            $scope.pageIndex = 1;
            _loadData(function (data) {
                $scope.vm.viewRowDataList = data;
                //Stop the ion-refresher from spinning
            }, null);
            $scope.$broadcast('scroll.refreshComplete');
        }
        _init();
    }

    xrmApp.controller("AccountLookupController", ['$scope','$rootScope', '$state', '$ionicActionSheet', 'rt','LookupService',AccountLookupController]);
})();



