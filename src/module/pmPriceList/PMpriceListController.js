/**
 * Created by chenpeng  on 2018/08/16. controller
 */
(function () {
    'use strict';

    function PMpriceListController($scope, $state, $stateParams, $ionicScrollDelegate, rt, PMpriceListService) {

        var pageIndex = 1;
        var pageSize = rt.getPaginationSize();

        rt.rootScope.$on("pmPriceList-refresh", function () {
            _refresh();
        });

        function _init() {
            $scope.vm = {
                queryValue: "",
                pmPriceList: []
            };

            //加载更多
            $scope.loadMoreData = _loadMoreData;
            //下拉刷新
            $scope.listRefresh = _viewRefresh;


            //返回
            $scope.goBack = _goBack;

           // $scope.createAppointment = _createAppointment;
           // 跳转到详情页面
            $scope.itemClick = _itemClick;

            //搜索
            $scope.search = _search;

            //是否需要加载更多
            $scope.isLoadMore = false;

            //加载数据
            rt.showLoadingToast('正在加载数据...');
            _loadData(function (data) {
                $scope.vm.pmPriceList = data;
                
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
            
        }


        //初始化数据
        function _loadData(success, failure) {
            PMpriceListService.getPMpriceList($scope.vm.queryValue, pageIndex, pageSize)
                .success(function (data) {
                    if (success) {
                        success(data);
                       // alert("测试"+JSON.stringify($scope.vm.pmPriceList));
                    //    alert("测试"+data.length);
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
                   // alert("测试"+JSON.stringify(error));
                    rt.showErrorToast(error);
                });
        }

        //搜索
        function _search() {
            $ionicScrollDelegate.scrollTop(true);
            pageIndex = 1;
            rt.showLoadingToast('正在加载中...');
            _loadData(function (data) {
                $scope.vm.pmPriceList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });
        }

        //加载更多
        function _loadMoreData() {
            if ($scope.isLoadMore) {
               pageIndex ++;
                _loadData(function (data) {
                    $scope.vm.pmPriceList.push.apply($scope.vm.pmPriceList, data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }

        function _refresh() {
            
            _loadData(function (data) {
                $scope.vm.pmPriceList = data;
                
            }, null);
        }

        //下拉刷新
        function _viewRefresh() {
            pageIndex = 1;
            _loadData(function (data) {
                $scope.vm.pmPriceList = data;
            }, null);
            $scope.$broadcast('scroll.refreshComplete');
        }

       // function _createAppointment() {
          //  $state.go("appointment-edit", {
           //     id: ""
          //  });
       // }

        //跳转详情页面 
       function _itemClick(id) {
        //    alert(id);
            // $state.go("h5.nbdeli.com/index2.html#Product/proinfo/"+id);
            // window.location="h5.nbdeli.com/index2.html#Product/proinfo/"+id;
            // $state.go("h5.nbdeli.com/index2.html#Product/proinfo", {
            //     id: id
            // });
            // var url=$state.href("h5.nbdeli.com/index2.html#Product/proinfo/"+id);
            // window.open(url);
          
 
            //    $location.path("h5.nbdeli.com/index2.html#Product/proinfo/"+id);
            var pmUrl = "http://h5.nbdeli.com/index2.html#Product/proinfo/ " + id;
            var test = "http://b2b.nbdeli.com/Goods/ItemDetail_  " + id + "_40.htm";
            window.location.href = test;

             
        }

        //返回
        function _goBack() {
          // wx.closeWindow();
         $state.go('home-main');
         // $ionicHistory.goBack();
        }

        _init();
     
    }

    xrmApp.controller("PMpriceListController", ['$scope', '$state', '$stateParams', '$ionicScrollDelegate', 'rt', 'PMpriceListService', PMpriceListController]);
})();

