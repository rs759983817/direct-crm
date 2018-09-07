/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global UITaskView:false */

(function () {
    'use strict';
    xrmApp.controller("DeveloperLanguageController", ['$scope', '$state', '$ionicHistory', '$translate', 'rt', DeveloperLanguageController]);
    function DeveloperLanguageController($scope, $state, $ionicHistory, $translate, rt) {

        function _init() {
            $scope.language = {};

            var languageCode = rt.getLanguageCode();
            if (languageCode !== null && languageCode !== undefined) {
                $scope.language.code = languageCode;
            }

            $scope.changeLanguage = function () {
                rt.setLanguageCode($scope.language.code);
                $ionicHistory.goBack();
            };
        }

        _init();
    }
})();



/*global UIMenu:false */
/*global xrmApp:false */
(function () {
    'use strict';

    function DeveloperLoginController($scope, $state, $filter, rt) {
        function _init() {
            $scope.vm = {};
            $scope.vm.isSavePassword = !!localStorage.XrmLoginIsSavePassword;
            $scope.vm.userName = localStorage.XrmLoginUserName;
            $scope.vm.password = localStorage.XrmLoginPassword;

            $scope.selectLanguage = function () {
                $state.go("dev-language");
            };

            $scope.savePassword = function () {
                $scope.vm.isSavePassword = !$scope.vm.isSavePassword;
            };

            $scope.setServerAddress = function () {
                $state.go("dev-serveraddress");
            };

            $scope.login = _login;
        }

        /**
         * 登陆
         * @private
         */
        function _login() {
            if (rt.isNullOrEmptyString($scope.vm.userName)) {
                rt.showErrorToast(rt.translate('LOGIN_PLS_INPUT_USERNAME'));
                return;
            }

            if (rt.isNullOrEmptyString($scope.vm.password)) {
                rt.showErrorToast(rt.translate('LOGIN_PLS_INPUT_PASSWORD'));
                return;
            }

            localStorage.XrmLoginIsSavePassword = $scope.vm.isSavePassword;
            localStorage.XrmLoginUserName = $scope.vm.userName;
            localStorage.XrmLoginPassword = $scope.vm.password;

            rt.showLoadingToast("登录中...");
            var data = "grant_type=password&username=" + $scope.vm.userName + "&password=" + $scope.vm.password;
            rt.post("token", data)
                .success(function (u) {
                    rt.hideLoadingToast();
                    localStorage.XrmAuthToken = u.access_token;
                    // localStorage.UserId = u.SystemUserId;
                    $state.go("dev-application");
                })
                .error(function (msg) {
                    rt.hideLoadingToast();
                    rt.showErrorToast(msg);
                });
        }

        _init();
    }

    xrmApp.controller("DeveloperLoginController", ['$scope', '$state', '$filter', 'rt', DeveloperLoginController]);
})();
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global UITaskView:false */

(function () {
    'use strict';

    function DeveloperApplicationController($scope, $state, $location, rt) {

        $scope.vm = {};
        function init() {
            $scope.serverAddress = rt.getBaseApiUrl();

            _loadMenuData();

            $scope.openMenu = function (url) {
                $location.path(url)
            };
        }

        function _loadMenuData() {
            $scope.vm.menus = [];
            var apiUrl = "api/portalmenu/MobileMenu/";
            rt.get(apiUrl)
                .success(function (data) {
                    $scope.vm.menus = data.SystemMenuList;
                });
        }

        init();
    }

    xrmApp.controller("DeveloperApplicationController", ['$scope', '$state', '$location', 'rt', DeveloperApplicationController]);
})();

/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global UITaskView:false */

(function() {
    'use strict';
    xrmApp.controller("DeveloperHomeController", ['$rootScope','$scope', '$state', 'rt','$q',DeveloperHomeController]);
    function DeveloperHomeController($rootScope,$scope, $state, rt, $q) {
        $scope.vm = {};
        $scope.vm.data={};//仪表板数据
        $scope.vm.cdata={};//日历关联数据
        $scope.vm.chooseDate=new Date();
        $scope.vm.nowDate=new Date();
        $scope.vm.weekDate=new Array(7);//周日历数据
        $scope.vm.dayName = ["日", "一", "二", "三", "四", "五", "六"];//星期标题
        //$scope.vm.isClicked=false;
        $scope.vm.pageIndex=1;//默认第一页
        $scope.vm.CalendarData = [];//拥有数据的日期 里面包含日期 2016/01/01
        var on_reload = $rootScope.$on('rt-reload-data', function() {
            _getDashBoardTab1Data();
        });
        var on_del_reload = $rootScope.$on('rt-del-reload-data', function() {
            _getDashBoardTab1Data();
        });
        $scope.$on('$ionicView.unloaded', function() {
            if (on_reload !== undefined) {
                on_reload();
            }
            if (on_del_reload !== undefined) {
                on_del_reload();
            }
        });
        _init();
        function _init() {
            var d = new Date();
            $scope.vm.choosedTabType = 1;
            $scope.vm.chooseTabClick=_chooseTabClick;
            $scope.vm.dateClick=_dateClick;
            $scope.vm.viewRefresh=_viewRefresh;
            $scope.vm.loadMoreClick=_loadMoreClick;
            $scope.vm.ItemClick=_ItemClick;
            _getDashBoardTab1Data();
        }
        function _chooseTabClick(tabType){
            $scope.vm.choosedTabType=tabType;
            if(tabType===2){
                _getDashBoardTab2Data();
            }
            else {//加载日历数据
                _getCalendarData().then(function(resp){
                    $scope.vm.CalendarData=resp.data;
                    _getCurrWeekDate();
                });

            }
        }
        //获取今日待办数据
        function  _getDashBoardTab1Data(){
            _getCalendarData().then(function(resp){
                $scope.vm.CalendarData=resp.data;
                _getCurrWeekDate();
                _dateClick($scope.vm.chooseDate);
            });
        }
        //获取仪表板数据
        function _getDashBoardTab2Data(){
            $q.all([
                _GetDashboardRankData(),
                _GetDashboardPercentData(),
                _GetDashboardVisitData()
            ]).then(function(responses){
                $scope.vm.data.AreaRank=responses[0].data.AreaRank;
                $scope.vm.data.AreaRankStar=responses[0].data.AreaRankStar;
                $scope.vm.data.CountryRank=responses[0].data.CountryRank;
                $scope.vm.data.CountryRankStar=responses[0].data.CountryRankStar;
                $scope.vm.data.YtdActualMoney=responses[1].data.YtdActualMoney;
                $scope.vm.data.YtdTagetMoney=responses[1].data.YtdTagetMoney;
                $scope.vm.data.YtdDonePercent=responses[1].data.YtdDonePercent;
                $scope.vm.data.MtdActualMoney=responses[1].data.MtdActualMoney;
                $scope.vm.data.MtdTagetMoney=responses[1].data.MtdTagetMoney;
                $scope.vm.data.MtdDonePercent=responses[1].data.MtdDonePercent;
                $scope.vm.data.VisitPercent=responses[2].data.VisitPercent;
                $scope.vm.data.VisitNumPerDay=responses[2].data.VisitNumPerDay;
                $scope.vm.data.WorkDay=responses[2].data.WorkDay;
            });
        }
        //今日代办条目点击事件
        function _ItemClick(type,id){
            if(type==='任务'){
                $state.go("task-read",{id:id});
            }
            else if(type==='商业拜访'){
                $state.go("visitrecord-edit",{id:id});
            }
            else if(type==='医院拜访'){
                $state.go("visithospital-edit",{id:id});
            }
            else if(type==='药店拜访'){
                $state.go("visitretail-editview",{id:id});
            }
            else if(type==='代理商拜访'){
                $state.go("visitagent-edit",{id:id});
            }
        }
        //获取仪表盘数据(区域、全国排名) Step1
        function _GetDashboardRankData(){
            var url="api/Dashboard/GetDashboardRankData";
            return rt.get(url);
        }

        //获取仪表盘数据 (获取达成率) Step2
        function _GetDashboardPercentData(){
            var url="api/Dashboard/GetDashboardPercentData";
            return rt.get(url);
        }

        //获取仪表盘拜访数据 Step3
        function _GetDashboardVisitData(){
            var url="api/Dashboard/GetDashboardVisitData";
            return rt.get(url);
        }

        //获取当周日历
        function _getCurrWeekDate(){
            var sunday = new Date($scope.vm.chooseDate);//选择的日期
            var nowDay = $scope.vm.chooseDate.getDay();//当前星期几 //当前星期几(0-6 0标识星期天)
            sunday.setDate(sunday.getDate() - nowDay);
            var weekSunday = new Date(sunday);//当前日期的第一天即周日
            for (var i = 0; i < 7; i++) {
                var tmp = new Date(sunday);
                if ($scope.vm.CalendarData.indexOf(_formatDateStr(tmp)) > -1) {
                    $scope.vm.weekDate[i]={ Name:tmp, Value: true };
                }
                else {
                    $scope.vm.weekDate[i]={ Name:tmp, Value: false };
                }
                sunday.setDate(sunday.getDate() + 1);
            }
        }
        //点击日历事件
        function _dateClick(date) {
            //$scope.vm.isClicked = true;
            $scope.vm.chooseDate = new Date(date);
            _loadData();
        }
        //加载数据
        function _loadData() {
            $scope.vm.PageIndex = 1;
            _loadCalendarByOption(function(data) {
                $scope.vm.cdata = data;
                rt.hideLoadingToast();
            }, function() {
                rt.hideLoadingToast();
            });
        }
        function _getCalendarListByPage(date,pageIndex){
            var url="api/Calendar/GetCalendarListByPage?date="+date;
            url+="&pageIndex="+pageIndex;
            url+="&pageSize="+rt.getPaginationSize();
            url+="&type=1";//自己的日历
            return rt.get(url);
        };
        //格式化日期
        function _formatDateStr(date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            month = month < 10 ? '0' + month : month + '';
            day = day < 10 ? '0' + day : day + '';
            return year + '-' + month + '-' + day;
        }
        //检查每天是否有数据
        function _getCalendarData(){
            var url='api/Calendar/GetCalendarData?type=1';
            return rt.get(url);
        }
        //刷新数据
        function _viewRefresh() {
            if($scope.vm.choosedTabType==1){
                $scope.vm.PageIndex = 1;
                _loadCalendarByOption(function(data) {
                    $scope.vm.cdata = data;
                }, null);
            }
            else {//仪表盘数据
                _getDashBoardTab2Data();
            }
            $scope.$broadcast('scroll.refreshComplete');
        }
        //加载更多的日历数据
        function _loadMoreClick() {
            if (!$scope.vm.isLoadMore) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return;
            }
            $scope.vm.PageIndex += 1;
            _loadCalendarByOption(function(data) {
                $scope.vm.cdata.push.apply($scope.vm.cdata, data);
            }, null);
        }
        //加载日历数据
        function _loadCalendarByOption(success, msg) {
            _getCalendarListByPage(_formatDateStr($scope.vm.chooseDate),$scope.vm.PageIndex)
                .success(function(data) {
                    if (success) {
                        success(data);
                    }
                    if (data.length < rt.getPaginationSize()) {
                        $scope.vm.isLoadMore = false;
                    }
                    else {
                        $scope.vm.isLoadMore = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
                .error(function(error) {
                    if (msg) {
                        msg();
                    }
                    rt.showErrorToast(error);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
        }
        //function _moreButtonClick() {
        //    location.href = "app:opennew@calendar/calendarListView";
        //}
        //
        //function _visitItemClick(type, id) {
        //    location.href = "app:opennew@visitrecord/visitListView";
        //}
        //function _taskItmeClick(id) {
        //    location.href = "app:opennew@task/list";
        //}
    }
})();



/*global UIMenu:false */
/*global xrmApp:false */
(function () {
    'use strict';
    xrmApp.controller("DeveloperMainController", ['$scope', '$state', '$stateParams', 'rt', DeveloperMainController]);

    function DeveloperMainController($scope, $state, $stateParams, rt) {
        _init();

        function _init() {

        }
        
        $scope.workspaceItemClick  = function(stateName){
              $state.go(stateName);
        };
    }
})();



/*global UIMenu:false */
/*global xrmApp:false */
(function () {
    'use strict';
    xrmApp.controller("DeveloperWorkspaceController", ['$scope', '$state', '$stateParams', 'rt', DeveloperWorkspaceController]);

    function DeveloperWorkspaceController($scope, $state, $stateParams, rt) {
        _init();

        function _init() {

        }
        
        $scope.workspaceItemClick  = function(stateName){
              $state.go(stateName);
        };
    }
})();
/*global UIMenu:false */
/*global xrmApp:false */
(function () {
    'use strict';
    xrmApp.controller("DeveloperServerAddressController", ['$scope','$ionicHistory', DeveloperServerAddressController]);

    function DeveloperServerAddressController($scope,$ionicHistory) {
        _init();

        function _init() {
            var ch = (document.documentElement.clientWidth || document.body.clientWidth);
            $scope.logoWidth = ch;

            $scope.save = _save;
            $scope.vm = {};
            $scope.vm.address = localStorage.XrmBaseUrl;
        }

        function _save() {
            localStorage.XrmBaseUrl = $scope.vm.address;
            $ionicHistory.goBack();
        }
    }
})();


