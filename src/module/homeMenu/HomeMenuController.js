/********************************************************
 Copyright @ 得力集团有限公司 All rights reserved.
 创建人   : chenpeng
 创建时间 : 2018/8/18.
 说明     : 主菜单页面Controller
 *********************************************************/
/*global angular:false */
/*global _:false */
/*global xrmApp:false */

(function () {
    'use strict';
    
    function HomeMenuController ($scope, $state,$stateParams, rt, HomeMenuService) {

        var pageIndex = 1;
        var pageSize = rt.getPaginationSize();

        rt.rootScope.$on("homemain-refresh", function () {
            _loadTerm(function(resule){
                $scope.term=resule;
                rt.hideLoadingToast();
            },function (error) {
                rt.hideLoadingToast();
                rt.showErrorToast(error);
            });
        });

        function _init () {
           // update_wx_title ('服务管理');
            $scope.vm={
                queryValue: "",
                appointmentList:[],
            };

            //加载数据
            
            _loadData(function (data) {
                $scope.vm.appointmentList = data;
                rt.hideLoadingToast();
            }, function () {
                rt.hideLoadingToast();
            });

           // $scope.term={};
           // $scope.vm.dataList=[];
            //清除缓存
            $scope.clearClick=_clearClick;
            //菜单点击事件
           // $scope.menuClick = _menuClick;
            //菜单点击事件
            $scope.priceClick = _priceClick;
            //菜单点击事件
            $scope.appointmentClick = _appointmentClick;
            //跳转到详情页面
            $scope.itemClick = _itemClick;
            /*
            rt.showLoadingToast("正在加载菜单...");
            _loadData(function (data) {
               // $scope.vm.dataList = data;
                _loadTerm(function(resule){
                    $scope.term=resule;
                    rt.hideLoadingToast();
                },function (error) {
                    rt.hideLoadingToast();
                    rt.showErrorToast(error);
                });
            }, function (error) {
                rt.hideLoadingToast();
                rt.showErrorToast(error);
            });*/
        }

        //初始化数据
        function _loadData(success, failure) {
            HomeMenuService.getHomeMenuList($scope.vm.queryValue, pageIndex, pageSize)
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

        /*
        * 加载数据
        * */
        // function _loadData(success, failure) {
        //     HomeService//getWeChatMenuList()
        //         .success(function (data) {
        //             if (success) {
        //                 success(data);
        //             }
        //         })
        //         .error(function (error) {
        //             if (failure) {
        //                 failure(error);
        //             }
        //         });
        // }
       

        /*
        * 菜单点击事件
        * 
        function _menuClick(row){
			if(row.Url.contains('http://')|| row.Url.contains('https://')){
				window.location.href=row.Url;
			}else if(row.Url=='appointment-list'||row.Url=='pmPriceList-list'){

                
                    $state.go(row.Url);
               
			}
			else{
				$state.go(row.Url);
			}
        }*/

        /*
        * 点击约会
        * */
        function _appointmentClick(){
			
           // row.Url=='appointment-list'
            $state.go('appointment-list');
        }
          /*
        * 点击价格
        * */
       function _priceClick(){
			
        // row.Url=='appointment-list'
         $state.go('pmPriceList-list');
     }

        //跳转详情页面
        function _itemClick(id) {
            $state.go("appointment-edit", {
                id: id
            });
        }
       
        /*
        * 清除缓存
        * */
        function _clearClick(){
            localStorage.clear();
            // //企业号
            // localStorage.Wechat_AOSmith_AppId = "";
            // localStorage.Wechat_AOSmith_AuthToken = "";
            // //正式服务号
            // localStorage.app="";
            // localStorage.XrmAuthToken_Aomis = "";
            // //测试服务号
            // localStorage.XrmAuthToken_AomisGZ = "";
            rt.closeWindow();
        }

        _init ();

    }

    xrmApp.controller ("HomeMenuController", ['$scope', '$state','$stateParams', 'rt', 'HomeMenuService', HomeMenuController]);

}) ();