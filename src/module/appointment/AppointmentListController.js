/**
 * Created by Beryl jiang on 2018/01/25.
 */
(function () {
    'use strict';

    function AppointmentListController($scope, $state, $stateParams, $ionicScrollDelegate, rt, AppointmentService) {

        var pageIndex = 1;
        var pageSize = rt.getPaginationSize();

        rt.rootScope.$on("appointment-refresh", function () {
            _refresh();
        });

        function _init() {
            $scope.vm = {
                queryValue: "",
                appointmentList: []
            };

            //加载更多
            $scope.loadMoreData = _loadMoreData;
            //下拉刷新
            $scope.listRefresh = _viewRefresh;


            //返回
            $scope.goBack = _goBack;

            $scope.createAppointment = _createAppointment;
            //跳转到详情页面
            $scope.itemClick = _itemClick;

            //搜索
            $scope.search = _search;

            //是否需要加载更多
            $scope.isLoadMore = false;

            //加载数据
            rt.showLoadingToast('正在加载数据...');
            _loadData(function (data) {
                $scope.vm.appointmentList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        //初始化数据
        function _loadData(success, failure) {
            AppointmentService.getAppointmentList($scope.vm.queryValue, pageIndex, pageSize)
                .success(function (data) {
                    if (success) {
                        success(data);
                    }
                    if (data.length < pageSize) {
                        $scope.isLoadMore = false;
                    } else {
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

        //搜索
        function _search() {
            $ionicScrollDelegate.scrollTop(true);
            $scope.pageIndex = 1;
            rt.showLoadingToast('正在加载中...');
            _loadData(function (data) {
                $scope.vm.appointmentList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        //加载更多
        function _loadMoreData() {
            if ($scope.isLoadMore) {
                $scope.pageIndex += 1;
                _loadData(function (data) {
                    $scope.vm.appointmentList.push.apply($scope.vm.appointmentList, data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function _refresh() {
            $scope.pageIndex = 1;
            _loadData(function (data) {
                $scope.vm.appointmentList = data;
                
            }, null);
        }

        //下拉刷新
        function _viewRefresh() {
            $scope.pageIndex = 1;
            _loadData(function (data) {
                $scope.vm.appointmentList = data;
            }, null);
            $scope.$broadcast('scroll.refreshComplete');
        }

        function _createAppointment() {
            $state.go("appointment-edit", {
                id: ""
            });
        }

        //跳转详情页面
        function _itemClick(id) {
            $state.go("appointment-edit", {
                id: id
            });
        }

        //返回
        function _goBack() {
           // wx.closeWindow();
            //javascript:history.back(-1);
          $state.go('home-main');
           // $ionicHistory.goBack();
        }

        _init();
       
    }

    xrmApp.controller("AppointmentListController", ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', 'rt', 'AppointmentService', AppointmentListController]);
})();