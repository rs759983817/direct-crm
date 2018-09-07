/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 应用的全局路由和全局配置项目
 版本号   ：7.4.4
 *********************************************************/

(function (win) {
    'use strict';

    require.config({
        packages: [{
            name: 'echarts',
            location: './lib/echarts',
            main: 'echarts'
        }, {
            name: 'zrender',
            location: './lib/zrender',
            main: 'zrender'
        }, {
            name: 'signature_pad',
            location: './lib/signature',
            main: 'signature'
        }]
    });

    win.xrmApp = angular.module('xrmApp', ['ngIOS9UIWebViewPatch', 'ionic', 'ng-mfb', 'pascalprecht.translate', 'ngScrollTo'])
        .config(function () { })
        .config([
            '$compileProvider',
            function ($compileProvider) {
                $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|local|data|blob|weixin|wxLocalResource|wxlocalresource):|file|data:image\/)/);
            }
        ])
        .config([
            '$locationProvider',
            function ($locationProvider) {
                //$locationProvider.html5Mode(false);
                //$locationProvider.hashPrefix('!');
            }
        ])
        .config([
            "$httpProvider",
            function ($httpProvider) {
                $httpProvider.defaults.useXDomain = true;
                //默认超时时间：10s
                $httpProvider.defaults.timeout = 10 * 1000;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
            }
        ])
        .config([
            "$ionicConfigProvider",
            function ($ionicConfigProvider) {
                $ionicConfigProvider.backButton.previousTitleText(false).text('');
                $ionicConfigProvider.templates.maxPrefetch(0);
                $ionicConfigProvider.scrolling.jsScrolling(true);
            }
        ])
        .config([
            '$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
                    .state('xrmApp', {
                        url: '/',
                        templateUrl: 'component/blankView.html',
                        controller: 'blankController'
                    })
                    .state('app-close', {
                        url: '/app/close',
                        templateUrl: 'component/blankView.html',
                        controller: 'blankController'
                    })
                    .state('wx-auth', {
                        url: '/wx/auth',
                        templateUrl: 'component/blankView.html',
                        controller: 'wxAuthController'
                    })
                    .state('wx-redirect', {
                        url: '/wx/redirect',
                        templateUrl: 'component/blankView.html',
                        controller: 'wxRedirectController'
                    });
                $urlRouterProvider.otherwise("/");
            }
        ])
        .config([
            '$translateProvider',
            function ($translateProvider) {
                var languageCode;

                if (window.XrmDeviceData && window.XrmDeviceData.getLanguageCode) {
                    languageCode = window.XrmDeviceData.getLanguageCode();
                } else if (localStorage.LanguageCode !== null && localStorage.LanguageCode !== undefined && localStorage.LanguageCode !== "") {
                    languageCode = localStorage.LanguageCode;
                } else {
                    languageCode = "zh-CN";
                }
                $translateProvider.preferredLanguage(languageCode);
            }
        ])
        .run([
            '$rootScope', '$state', '$ionicHistory', 'rt',
            function ($rootScope, $state, $ionicHistory, rt) {
                var isWeixinBrowser = rt.isWeixinBrowser();
                $rootScope.isWechat = isWeixinBrowser;
                $rootScope.isApp = !isWeixinBrowser;

                var openedPopup = null;
                $rootScope.$on('xrm.popup.shown', function (event, popup) {
                    openedPopup = popup;
                });
                $rootScope.$on('xrm.popup.hidden', function (event, popup) {
                    openedPopup = null;
                });

                var openedPopover = null;
                $rootScope.$on('xrm.popover.shown', function (event, popover) {
                    openedPopover = popover;
                });
                $rootScope.$on('xrm.popover.hidden', function (event, popover) {
                    openedPopover = null;
                });

                var openedDialog = null;
                $rootScope.$on('xrm.modal.shown', function (event, modal) {
                    openedDialog = modal;
                });
                $rootScope.$on('xrm.modal.hidden', function (event, modal) {
                    openedDialog = null;
                });

                document.addEventListener("xrmhardwarebackclick", function () {
                    if (openedPopup != null || openedPopover != null || openedDialog != null) {
                        if (openedPopup != null) {
                            openedPopup.close();
                            openedPopup = null;
                        }
                        if (openedPopover != null) {
                            openedPopover.hide();
                            openedPopover = null;
                        }
                        if (openedDialog != null) {
                            openedDialog.hide();
                            openedDialog = null;
                        }

                        return;
                    }

                    if ($ionicHistory.currentView() !== null && $ionicHistory.currentView().goBack) {
                        $ionicHistory.currentView().goBack();
                    } else {
                        rt.goBack();
                    }
                }, false);

                window.fireHardwareBackClick = function () {
                    var event;
                    var eventName = "xrmhardwarebackclick";

                    if (document.createEvent) {
                        event = document.createEvent("HTMLEvents");
                        event.initEvent(eventName, true, true);
                    } else {
                        event = document.createEventObject();
                        event.eventType = eventName;
                    }

                    event.eventName = eventName;

                    if (document.createEvent) {
                        document.dispatchEvent(event);
                    } else {
                        document.fireEvent("on" + event.eventType, event);
                    }
                };
            }
        ]);
})(window);
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : East Lv
 创建时间 : 2016-06-24
 说明     : rt base controller
 *********************************************************/
function rtBaseController(scope, rt) {

    var self = this;
    var $scope = scope;
    var $state = rt.state;
    var $ionicHistory = rt.ionicHistory;
    var $rootScope = rt.rootScope;

    function _load() {
        _init();

        if (_isLoadMethodDefined()) {
            rt.showLoadingToast("正在加载...");
            self.onLoad(function() {
                rt.hideLoadingToast();

                $scope.rt.page.isLoaded = true;
            }, function(errorMessage, ignoreError) {
                rt.hideLoadingToast();

                $scope.rt.page.isLoaded = true;

                if (!ignoreError) {
                    rt.alert(errorMessage);
                }
            });
        }
    }

    function _init() {
        $scope.rt = {
            page: {
                isLoaded: false
            },
            actions: {
                goBack: _goBack,
                refresh: _refresh,
                gotoState: _gotoState
            }
        };

        _registerEvent();

        if (_isInitMethodDefined()) {
            self.onInit();
        }
    }

    function _refresh() {
        if (!_isLoadMethodDefined()) {
            return;
        }

        self.onLoad(function() {
            $scope.$broadcast('scroll.refreshComplete');
        }, function(errorMessage, ignoreError) {
            $scope.$broadcast('scroll.refreshComplete');

            if (!ignoreError) {
                rt.alert(errorMessage);
            }
        });
    }

    function _isInitMethodDefined() {
        return rt.isFunction(self.onInit);
    }

    function _isLoadMethodDefined() {
        return rt.isFunction(self.onLoad);
    }

    function _goBack() {
        if ($ionicHistory.currentView() !== null && $ionicHistory.currentView().goBack) {
            $ionicHistory.currentView().goBack();
        } else {
            rt.goBack();
        }
    }

    function _gotoState(state, params) {
        $state.go(state, params);
    }

    function _registerEvent() {
        // $scope.$on('popup.shown', function (event, popup) {
        //     $rootScope.$broadcast('xrm.popup.shown',popup);
        // });
        // $scope.$on('popup.hidden', function (event, popup) {
        //     $rootScope.$broadcast('xrm.popup.hidden',popup);
        // });

        // $scope.$on('popover.shown', function (event, popover) {
        //     $rootScope.$broadcast('xrm.popover.shown',popover);
        // });
        // $scope.$on('popover.hidden', function (event, popover) {
        //     $rootScope.$broadcast('xrm.popover.hidden',popover);
        // });

        // $scope.$on('modal.shown', function (event, modal) {
        //     $rootScope.$broadcast('xrm.modal.shown',modal);
        // });
        // $scope.$on('modal.hidden', function (event, modal) {
        //     $rootScope.$broadcast('xrm.modal.hidden',modal);
        // });
    }

    this.registerInitMethod = function(fn) {
        this.onInit = fn;
        return this;
    };

    this.registerGoBackMethod = function(fn) {
        $ionicHistory.currentView().goBack = fn;
        return this;
    };

    this.executeLoadMethod = function(fn) {
        this.onLoad = fn;
        $scope.$on('$ionicView.beforeEnter', function() {
            _load();
        });
    };
}
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 自定义实体的列表页面
 *********************************************************/
function rtListController(scope, rt) {

    var self = this;
    var $scope = scope;
    var $state = rt.state;
    var $ionicHistory = rt.ionicHistory;
    var $rootScope = rt.rootScope;

    var pageIndex = 1;

    function _load() {
        //初始化
        _init();

        if (_isLoadMethodDefined()) {
            rt.showLoadingToast("正在加载...");
            self.onLoad(function() {
                rt.hideLoadingToast();

                $scope.rt.page.isLoaded = true;
            }, function(errorMessage, ignoreError) {
                rt.hideLoadingToast();

                $scope.rt.page.isLoaded = true;

                if (!ignoreError) {
                    rt.alert(errorMessage);
                }
            });
        }
    }

    function _init() {
        $scope.rt = {
            page: {
                isLoaded: false,
                isLoadMore: true,
            },
            actions: {
                goBack: _goBack,
                search: _search,
                refresh: _refresh,
                loadMore: _loadMore,
                gotoState: _gotoState
            }
        };

        _registerEvent();

        if (_isInitMethodDefined()) {
            self.onInit();
        }
    }

    function _search() {
        if (!_isSearchMethodDefined()) {
            return;
        }

        rt.showLoadingToast("正在查询...");
        self.onSearch(pageIndex, function() {
            rt.hideLoadingToast();
        }, function(errorMessage) {
            rt.hideLoadingToast();

            rt.showErrorToast(errorMessage);
        });
    }

    function _loadMore() {
        if (!_isSearchMethodDefined()) {
            return;
        }

        if (!$scope.rt.page.isLoadMore) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            return;
        }

        pageIndex += 1;

        self.onSearch(pageIndex, function(dataList, pageSize) {
            if (rt.isNull(pageSize)) {
                pageSize = rt.getPaginationSize();
            }

            if (rt.isNull(dataList) || dataList.length < pageSize) {
                $scope.rt.page.isLoadMore = false;
            }

            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(errorMessage) {
            rt.showErrorToast(errorMessage);
        });
    }

    function _refresh() {
        if (!_isSearchMethodDefined()) {
            return;
        }

        pageIndex = 1;

        self.onSearch(pageIndex, function() {
            $scope.$broadcast('scroll.refreshComplete');
        }, function(errorMessage) {
            $scope.$broadcast('scroll.refreshComplete');
            rt.showErrorToast(errorMessage);
        });
    }

    function _isInitMethodDefined() {
        return rt.isFunction(self.onInit);
    }

    function _isLoadMethodDefined() {
        return rt.isFunction(self.onLoad);
    }

    function _isSearchMethodDefined() {
        return rt.isFunction(self.onSearch);
    }

    function _goBack() {
        if ($ionicHistory.currentView() !== null && $ionicHistory.currentView().goBack) {
            $ionicHistory.currentView().goBack();
        } else {
            rt.goBack();
        }
    }

    function _gotoState(state, params) {
        $state.go(state, params);
    }

    function _registerEvent() {
        // $scope.$on('popup.shown', function (event, popup) {
        //     $rootScope.$broadcast('xrm.popup.shown',popup);
        // });
        // $scope.$on('popup.hidden', function (event, popup) {
        //     $rootScope.$broadcast('xrm.popup.hidden',popup);
        // });

        // $scope.$on('popover.shown', function (event, popover) {
        //     $rootScope.$broadcast('xrm.popover.shown',popover);
        // });
        // $scope.$on('popover.hidden', function (event, popover) {
        //     $rootScope.$broadcast('xrm.popover.hidden',popover);
        // });

        // $scope.$on('modal.shown', function (event, modal) {
        //     $rootScope.$broadcast('xrm.modal.shown',modal);
        // });
        // $scope.$on('modal.hidden', function (event, modal) {
        //     $rootScope.$broadcast('xrm.modal.hidden',modal);
        // });
    }

    this.registerInitMethod = function(fn) {
        this.onInit = fn;
        return this;
    };

    this.registerSearchMethod = function(fn) {
        this.onSearch = fn;
        return this;
    };


    this.registerGoBackMethod = function(fn) {
        $ionicHistory.currentView().goBack = fn;
        return this;
    };

    this.executeLoadMethod = function(fn) {
        this.onLoad = fn;
        $scope.$on('$ionicView.loaded', function() {
            _load();
        });
    };
}
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : edgardong
 创建时间 : 2017-04-14
 说明     : 微信身份验证Control
 *********************************************************/
/*global UIMenu:false */
/*global xrmApp:false */
(function () {
    'use strict';
    xrmApp.controller("wxAuthController", ['$scope', '$state', 'rt', '$stateParams', wxAuthController]);

    function wxAuthController($scope, $state, rt, $stateParams) {
        var appName = rt.getUrlParamFromHash("appName") || localStorage.Wechat_AppName;
        localStorage.Wechat_AppName = appName;

        var authToken = localStorage["Wechat_" + appName + "_AuthToken"];

        //如果已经验认过了，则直接到功能页面
        if (!rt.isNullOrEmptyString(authToken)) {
            var redirectUrlParams = rt.getUrlParamFromHash("redirectUrlParams");
            var redirectUrlParamsObj = {};
            if (redirectUrlParams) {
                redirectUrlParamsObj = JSON.parse(decodeURIComponent(redirectUrlParams));
            }

            $state.go(rt.getUrlParamFromHash("redirectUrl"), redirectUrlParamsObj);
            return;
        }

        //否则先获取当前用户的信息
        var code = rt.getUrlParamFromHash("code");
        if (rt.isNullOrEmptyString(code)) {
            getAppId(appName, function (appId) {
                var redirect_uri = location.href.replace(/wx\/auth/, 'wx/auth2'); // 这里重定向到另一个路由，解决企业号不能刷新页面的问题（企业号无此问题）
                var url = "https://open.weixin.qq.com/connect/oauth2/authorize?" + "appid=" + appId + "&redirect_uri=" + encodeURIComponent(redirect_uri) + "&response_type=code" + "&scope=snsapi_base" + "&state=#wechat_redirect";
                location.replace(url);
            });
            return;
        }

        //通过code获取token并跳转到页面中
        var apiUrl_code = "api/wechat/GetToken?code=" + code;

        rt.get(apiUrl_code).then(
            function (token) {
                localStorage["Wechat_" + appName + "_AuthToken"] = token.data;

                var redirectUrlParams = rt.getUrlParamFromHash("redirectUrlParams");
                var redirectUrlParamsObj = {};
                if (redirectUrlParams) {
                    redirectUrlParamsObj = JSON.parse(decodeURIComponent(redirectUrlParams));
                }

                $state.go(rt.getUrlParamFromHash("redirectUrl"), redirectUrlParamsObj);
            },
            function (err) {
                rt.alert(err.message);
            }
        );

        // 获取APPID
        function getAppId(appName, success, error) {
            var wxAppId = localStorage["Wechat_" + appName + "_AppId"];
            if (!rt.isNullOrEmptyString(wxAppId)) {
                success(wxAppId);
                return;
            }

            var apiUrl = "api/wechat/GetAppId";
            rt.get(apiUrl).then(
                function (appId) {
                    localStorage["Wechat_" + appName + "_AppId"] = appId.data;
                    success(appId.data);
                }
            );

        }
    }
})();
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : edgardong
 创建时间 : 2017-04-14
 说明     : 微信重定向Control
 *********************************************************/
/*global UIMenu:false */
/*global xrmApp:false */
(function() {
    'use strict';
    xrmApp.controller("wxRedirectController", ['$scope', '$state', 'rt', '$stateParams', wxRedirectController]);

    function wxRedirectController($scope, $state, rt, $stateParams) {
        var appName = rt.getUrlParamFromHash("appName") || localStorage.Wechat_AppName;
        localStorage.Wechat_AppName = appName;

        var authToken = localStorage["Wechat_" + appName + "_AuthToken"];

        //如果已经验认过了，则直接到功能页面
        if (!rt.isNullOrEmptyString(authToken)) {
            var redirectUrlParams = rt.getUrlParamFromHash("redirectUrlParams");
            var redirectUrlParamsObj = {};
            if (redirectUrlParams) {
                redirectUrlParamsObj = JSON.parse(decodeURIComponent(redirectUrlParams));
            }

            $state.go(rt.getUrlParamFromHash("redirectUrl"), redirectUrlParamsObj);
            return;
        }

        //获取url中是否有openID
        var openid = rt.getUrlParamFromHash("openid");
        if (!rt.isNullOrEmptyString(openid)) {
            var apiUrl = "api/wechat/GetTokenByOpenId?openid=" + openid;
            rt.get(apiUrl).then(
                function(token) {
                    localStorage["Wechat_" + appName + "_AuthToken"] = token.data;

                    var redirectUrlParams = rt.getUrlParamFromHash("redirectUrlParams");
                    var redirectUrlParamsObj = {};
                    if (redirectUrlParams) {
                        redirectUrlParamsObj = JSON.parse(decodeURIComponent(redirectUrlParams));
                    }

                    $state.go(rt.getUrlParamFromHash("redirectUrl"), redirectUrlParamsObj);
                    return;
                },
                function(error) {
                    rt.alert(error.message);
                }
            );
            return;
        }

    }
})();
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : Channing Kuo
 创建时间 : 2016-12-12
 说明     : 录音
 *********************************************************/
(function() {
    'use strict';
    xrmApp.controller("audioRecordController", ['$scope', 'rt', '$timeout', '$rootScope', audioRecordController]);
    function audioRecordController($scope, rt, $timeout, $rootScope) {
      //  还未录音         录音中         结束录音        正在播放录音
      var STARTRECOR = 0, RECORDING = 1, RECORDEND = 2, AUDIOPLAYING = 3;
      var interval;         // 时间动画控制变量
      var audioLocalId;     // 音频的本地ID

      function init() {
          $scope.recordButtonState = STARTRECOR;
          $scope.timeSpan = "";
          $scope.titleMessage = "点击按钮，开始录制你想说的话吧。";
          $scope.recordButtonState = STARTRECOR;
          wx.stopRecord({
              success: function (res) {
                audioLocalId = "";
                $scope.$apply();
              }
          });
          $scope.startRecord = _startRecord;
          $scope.cancelClick = _cancelClick;
          $scope.commit = _commit;

          wx.onVoiceRecordEnd({
              // 录音时间超过一分钟没有停止的时候会执行 complete 回调
              complete: function (res) {
                  $scope.titleMessage = "点击按钮，试听一下吧。";
                  $scope.recordButtonState = RECORDEND;
                  clearInterval(interval);
                  interval = null;
                  audioLocalId = res.localId;
                  $scope.$apply();
              }
          });

          wx.onVoicePlayEnd({
              success: function (res) {
                  $scope.titleMessage = "点击按钮，试听一下吧。";
                  $scope.recordButtonState = RECORDEND;
                  audioLocalId = res.localId; // 返回音频的本地ID
                  $scope.$apply();
              }
          });
      }

      /**
      * 取消，回到开始录音界面
      */
      function _cancelClick(){
          $scope.timeSpan = "";
          // 先停止当前正在播放的录音
          wx.stopVoice({
              localId: audioLocalId // 需要停止的音频的本地ID，由stopRecord接口获得
          });
          $scope.titleMessage = "点击按钮，开始录制你想说的话吧。";
          $scope.recordButtonState = STARTRECOR;
          wx.stopRecord({
              success: function (res) {
                audioLocalId = "";
                $scope.$apply();
              }
          });
      }

      /**
      * 提交录音到微信服务器，并返回服务器端ID和时长
      */
      function _commit(){
          if(!rt.isNullOrEmptyString(audioLocalId)){
              // 先停止当前正在播放的录音
              wx.stopVoice({
                  localId: audioLocalId // 需要停止的音频的本地ID，由stopRecord接口获得
              });
              // 然后把录音上传到微信服务器
              wx.uploadVoice({
                  localId: audioLocalId,      // 需要上传的音频的本地ID，由stopRecord接口获得
                  isShowProgressTips: 1,             // 默认为1，显示进度提示
                  success: function (res) {
                      var serverId = res.serverId;   // 返回音频的服务器端ID
                      var audio = {};
                      audio.serverId = serverId;
                      audio.timeSpan = $scope.timeSpan;
                      $scope.closeDialog();
                      if (rt.isFunction($scope.onDataSelected) && !rt.isNull(audio)) {
                          $scope.onDataSelected(audio);
                      }
                  }
              });
          }else{
              rt.showErrorToast("音频文件本地ID丢失，请确认已经录音完毕！");
          }
      }

      /**
      * 开始录音、结束录音、播放录音、暂停播放
      */
      function _startRecord(){
          switch ($scope.recordButtonState){
              case STARTRECOR:
                  $scope.titleMessage = "点击按钮，结束录音。";
                  $scope.recordButtonState = RECORDING;
                  // 调用微信接口开始录音
                  wx.startRecord();
                  timeRun();
                  break;
              case RECORDING:
                  $scope.titleMessage = "点击按钮，试听一下吧。";
                  $scope.recordButtonState = RECORDEND;
                  clearInterval(interval);
                  interval = null;
                  // 调用微信接口结束录音
                  wx.stopRecord({
                      success: function (res) {
                        audioLocalId = res.localId;
                        //$scope.$apply();
                      }
                  });
                  break;
              case RECORDEND:
                  $scope.titleMessage = "点击按钮，停止播放录音。";
                  $scope.recordButtonState = AUDIOPLAYING;
                  // 调用微信接口播放录音
                  if(!rt.isNullOrEmptyString(audioLocalId)){
                      wx.playVoice({
                          localId: audioLocalId // 需要播放的音频的本地ID，由stopRecord接口获得
                      });
                  }else{
                      rt.showErrorToast("音频文件本地ID丢失，请确认已经录音完毕！");
                  }
                  break;
              case AUDIOPLAYING:
                  $scope.titleMessage = "点击按钮，试听一下吧。";
                  $scope.recordButtonState = RECORDEND;
                  // 调用微信接口暂停播放录音
                  if(!rt.isNullOrEmptyString(audioLocalId)){
                      wx.stopVoice({
                          localId: audioLocalId // 需要停止的音频的本地ID，由stopRecord接口获得
                      });
                  }else{
                      rt.showErrorToast("音频文件本地ID丢失，请确认已经录音完毕！");
                  }
                  break;
          }
      }

      /**
      * 时间动画
      */
      function timeRun(){
          var reg = /^\d$/, step = 1000, sum = 0;
          if (!interval) {
            interval = setInterval(function() {
                sum += 1;
                var d = new Date("1111/1/1,0:0");
                d.setSeconds(sum);
                var m = d.getMinutes();
                m = reg.test(m) ? "0" + m + "\'" : m + "\'";
                var s = d.getSeconds();
                s = reg.test(s) ? "0" + s + "\"" : s + "\"";
                $scope.timeSpan = m + s;
                $scope.$apply();
              }, step);
            }
      }

      init();
    }
})();

/*global UIMenu:false */
/*global xrmApp:false */
(function() {
    'use strict';
    xrmApp.controller("blankController", [blankController]);

    function blankController() {}
})();

/********************************************************
 Copyright @ 苏州瑞云信息技术有限公司 All rights reserved.
 创建人   : 
 创建时间 : 2016/4/1
 说明     :可滑动预览照片
 *********************************************************/
(function() {
    'use strict';
    xrmApp.controller("cascadePickerController", ['$scope', '$ionicSlideBoxDelegate', 'rt', '$timeout', cascadePickerController]);

    function cascadePickerController($scope, $ionicSlideBoxDelegate, rt, $timeout) {

        function _init() {
            $scope.cascadePicker = $scope.cascadePicker || {};

            $scope.cascadePicker.objects = [];

            $scope.cascadePicker.slideHasChanged = _slideHasChanged;

            $scope.cascadePicker.slideTo = _slideTo;

            $scope.cascadePicker.pick = _pick;

            _load();
        }

        function _load() {
            if (rt.isNull($scope.cascadePicker.dataProvider)) {
                return;
            }

            //如果没有选中值，则只需要加载第一项
            if (rt.isNull($scope.cascadePicker.selectedValue) || $scope.cascadePicker.selectedValue.length === 0) {
                $scope.cascadePicker.objects.push({
                    dataSource: null
                });
                $scope.cascadePicker.dataProvider[0]().then(function(resp) {
                    $scope.cascadePicker.objects[0].dataSource = resp.data;
                    $scope.slideIndex = 0;
                });
                return;
            }

            var tmpObjects = [{
                dataSource: null
            }];

            function ___load(idx, value) {
                $scope.cascadePicker.dataProvider[idx](value)
                    .then(function(resp) {
                        tmpObjects[idx].dataSource = resp.data;

                        var selectedValue = $scope.cascadePicker.selectedValue[idx].value;
                        var selectedItem = _.find(resp.data, { "value": selectedValue });

                        if (!rt.isNull(selectedItem)) {
                            tmpObjects[idx].selectedValue = selectedItem;
                        }

                        if (rt.isNull(selectedItem) || idx >= $scope.cascadePicker.dataProvider.length - 1) {
                            $scope.cascadePicker.objects = tmpObjects;

                            $ionicSlideBoxDelegate.update();

                            $scope.cascadePicker.slideIndex = idx;
                        } else {
                            tmpObjects.push({
                                dataSource: null
                            });
                            ___load(idx + 1, selectedItem.value);
                        }
                    });
            }

            ___load(0);
        }

        function _pick(index, obj) {
            if (index + 1 >= $scope.cascadePicker.dataProvider.length) {
                $scope.cascadePicker.objects[index].selectedValue = obj;

                var result = [];
                $scope.cascadePicker.objects.map(function(obj) {
                    result.push({ "value": obj.selectedValue.value, "text": obj.selectedValue.text });
                });

                $scope.cascadePicker.close();
                $scope.cascadePicker.success(result);
                $scope.cascadePicker = null;
                delete $scope.cascadePicker;
                return;
            }

            if (obj === $scope.cascadePicker.objects[index].selectedValue) {
                _slideTo(index + 1);
                return;
            }

            $scope.cascadePicker.objects[index].selectedValue = obj;

            while ($scope.cascadePicker.objects.length > index + 1) {
                $scope.cascadePicker.objects.pop();
            }

            if ($scope.cascadePicker.objects.length === index + 1 || $scope.cascadePicker.objects[index + 1].dataSource === null || $scope.cascadePicker.objects[index + 1].dataSource === undefined) {

                $scope.cascadePicker.objects.push({
                    dataSource: null
                });

                $scope.cascadePicker.dataProvider[index + 1](obj.value)
                    .then(function(resp) {
                        $scope.cascadePicker.objects[index + 1].dataSource = resp.data;
                    });

                $ionicSlideBoxDelegate.update();
            }

            _slideTo(index + 1);
        }

        function _slideTo(index) {
            $timeout(function() {
                $ionicSlideBoxDelegate.slide(index);
            }, 0);
        }

        function _slideHasChanged(index) {
            $scope.cascadePicker.slideIndex = index;
        }

        _init();
    }
})();

/********************************************************
 Copyright @ 苏州瑞云信息技术有限公司 All rights reserved.
 创建人   : 
 创建时间 : 2016/4/1
 说明     :可滑动预览照片
 *********************************************************/
(function() {
    'use strict';
    xrmApp.controller("datePickerController", ['$scope', '$ionicSlideBoxDelegate', 'rt', '$timeout', datePickerController]);

    function datePickerController($scope, $ionicSlideBoxDelegate, rt, $timeout) {

        function _init() {
            $scope.datePicker = $scope.datePicker || {};

            var cellHeight = parseInt(rt.getScreenWidth() / 7 * 0.8);
            if (cellHeight > 50) {
                cellHeight = 50;
            }
            $scope.datePicker.cellHeight = cellHeight;
            if (rt.isNull($scope.datePicker.selectedValue)) {
                var now = new Date();
                $scope.datePicker.selectedValue = now;
            }
            $scope.datePicker.selectedValue.setHours(0, 0, 0, 0);

            var year = $scope.datePicker.selectedValue.getFullYear();
            var month = $scope.datePicker.selectedValue.getMonth() + 1;
            $scope.datePicker.year = year;
            $scope.datePicker.month = month;
            $scope.datePicker.calandar = rt.getCalandar(year, month);

            $scope.datePicker.chooseDate = _chooseDate;

            $scope.datePicker.previousYear = _previousYear;
            $scope.datePicker.nextYear = _nextYear;
            $scope.datePicker.previousMonth = _previousMonth;
            $scope.datePicker.nextMonth = _nextMonth;

            $scope.datePicker.clear = _clear;
            $scope.datePicker.ok = _ok;
        }

        _init();

        function _previousMonth() {
            var year = $scope.datePicker.year;
            var month = $scope.datePicker.month;
            if (month === 1) {
                year--;
                month = 12;
            } else {
                month--;
            }

            $scope.datePicker.year = year;
            $scope.datePicker.month = month;
            $scope.datePicker.calandar = rt.getCalandar(year, month);
        }

        function _nextMonth() {
            var year = $scope.datePicker.year;
            var month = $scope.datePicker.month;
            if (month === 12) {
                year++;
                month = 1;
            } else {
                month++;
            }

            $scope.datePicker.year = year;
            $scope.datePicker.month = month;
            $scope.datePicker.calandar = rt.getCalandar(year, month);
        }

        function _previousYear() {
            var year = $scope.datePicker.year;
            var month = $scope.datePicker.month;
            if (year === 1970) {
                return;
            }

            year--;

            $scope.datePicker.year = year;
            $scope.datePicker.month = month;
            $scope.datePicker.calandar = rt.getCalandar(year, month);
        }

        function _nextYear() {
            var year = $scope.datePicker.year;
            var month = $scope.datePicker.month;

            year++;

            $scope.datePicker.year = year;
            $scope.datePicker.month = month;
            $scope.datePicker.calandar = rt.getCalandar(year, month);
        }

        function _chooseDate(date) {
            if (date == null) {
                return;
            }
            $scope.datePicker.selectedValue = date;
        }

        function _clear() {
            $scope.datePicker.close();

            $scope.datePicker.selectedValue = null;

            if ($scope.datePicker.success) {
                $scope.datePicker.success(null);
            }
        }

        function _ok() {
            $scope.datePicker.close();

            if ($scope.datePicker.success) {
                $scope.datePicker.success($scope.datePicker.selectedValue);
            }
        }
    }
})();

/********************************************************
 Copyright @ 苏州瑞云信息技术有限公司 All rights reserved.
 创建人   : Berry Ding
 创建时间 : 2016/4/1
 说明     :可滑动预览照片
 *********************************************************/
(function() {
    'use strict';
    xrmApp.controller("imagePreviewerController", ['$scope', '$stateParams', 'rt', '$timeout', '$rootScope', imagePreviewerController]);

    function imagePreviewerController($scope, $stateParams, rt, $timeout, $rootScope) {

        $scope.screenWidth = (document.documentElement.clientWidth || document.body.clientWidth) + "px";
        $scope.screenHeight = (document.documentElement.clientHeight || document.body.clientHeight) + "px";

        window.onresize = function() {
            $scope.screenWidth = (document.documentElement.clientWidth || document.body.clientWidth) + "px";
            $scope.screenHeight = (document.documentElement.clientHeight || document.body.clientHeight) + "px";
        };

        $scope.deleteImage = function() {
            var imageId = $scope.previewImageList[$scope.myActiveSlide].Id;
            if (rt.isNullOrEmptyString(imageId)) {
                $scope.closeDialog();

                if ($scope.onImageDeleted) {
                    $scope.onImageDeleted($scope.myActiveSlide);
                }
            } else {
                rt.deleteFileByFileId("Attachment", [imageId])
                    .success(function() {
                        $scope.closeDialog();

                        if ($scope.onImageDeleted) {
                            $scope.onImageDeleted($scope.myActiveSlide);
                        }
                    });
            }
        };
    }
})();


/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : Edgard Dong
 创建时间 : 2016/7/18
 说明     : 签名
 *********************************************************/
(function() {
    'use strict';
    xrmApp.controller("signatureController", ['$scope', '$stateParams', 'rt', '$timeout', '$rootScope', signatureController]);

    function signatureController($scope, $stateParams, rt, $timeout, $rootScope) {

        var signaturePad;
        var canvas;

        require(['lib/signature/signature_pad.min'], function(params) {
            var canvas = document.getElementById('signatureCanvas');
            signaturePad = new SignaturePad(canvas);
            canvas.height = document.documentElement.clientHeight;
            canvas.width = document.documentElement.clientWidth;
        });

        /**
         * 清除按钮点击事件
         */
        $scope.clearClick = function() {
            signaturePad.clear();
        };

        /**
         * 确定按钮点击事件
         */
        $scope.saveClick = function() {
            if (signaturePad.isEmpty()) {
                alert("Please provide signature first.");
            } else {
                var u = signaturePad.toDataURL().split(',')[1];
                $scope.closeDialog();
                if (rt.isFunction($scope.onDataSelected) && !rt.isNull(u)) {
                    $scope.onDataSelected(u);
                }
            }
        };
    }
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 格式化数据的Filter
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .filter('friendlyFormatDateTime', function() {

            function formatDateTime(d, format) {
                var o = {
                    "M+": d.getMonth() + 1, //month
                    "d+": d.getDate(), //day
                    "h+": d.getHours(), //hour
                    "m+": d.getMinutes(), //minute
                    "s+": d.getSeconds(), //second
                    "q+": Math.floor((d.getMonth() + 3) / 3), //quarter
                    "S": d.getMilliseconds() //millisecond
                };

                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
                }

                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }

            return function(input) {
                var d;
                if (typeof input === 'string') {
                    d = moment(input).toDate();
                } else {
                    d = input;
                }

                var today = new Date();
                today.setHours(23, 59, 59, 999);

                var friendlyDateString;

                var internalDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                if (internalDays >= -2 && internalDays <= 2) {
                    switch (internalDays) {
                        case -2:
                            friendlyDateString = "后天" + formatDateTime(d, " hh:mm");
                            break;
                        case -1:
                            friendlyDateString = "明天" + formatDateTime(d, " hh:mm");
                            break;
                        case 0:
                            friendlyDateString = "今天" + formatDateTime(d, " hh:mm");
                            break;
                        case 1:
                            friendlyDateString = "昨天" + formatDateTime(d, " hh:mm");
                            break;
                        case 2:
                            friendlyDateString = "前天" + formatDateTime(d, " hh:mm");
                            break;
                        default:
                            friendlyDateString = formatDateTime(d, "yyyy-MM-dd hh:mm");
                            break;
                    }

                    return friendlyDateString;
                }

                if (today.getMonth() == d.getMonth() && today.getFullYear() == d.getFullYear()) {
                    return "本月" + formatDateTime(d, "dd") + '号';
                }

                if (today.getFullYear() == d.getFullYear()) {
                    return formatDateTime(d, "MM") + "月" + formatDateTime(d, "dd") + '号';
                }

                return "";

            };
        })
        .filter('friendlyFormatDate', function() {

            function formatDateTime(d, format) {
                var o = {
                    "M+": d.getMonth() + 1, //month
                    "d+": d.getDate(), //day
                    "h+": d.getHours(), //hour
                    "m+": d.getMinutes(), //minute
                    "s+": d.getSeconds(), //second
                    "q+": Math.floor((d.getMonth() + 3) / 3), //quarter
                    "S": d.getMilliseconds() //millisecond
                };

                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
                }

                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                }
                return format;
            }

            return function(input) {
                if (input === undefined || input === null)
                    return;

                var d;
                if (typeof input === 'string') {
                    d = moment(input).toDate();
                } else {
                    d = input;
                }

                var today = new Date();
                today.setHours(23, 59, 59, 999);

                var friendlyDateString;

                var internalDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                switch (internalDays) {
                    case -2:
                        friendlyDateString = "后天";
                        break;
                    case -1:
                        friendlyDateString = "明天";
                        break;
                    case 0:
                        friendlyDateString = "今天" + formatDateTime(d, " hh:mm");
                        break;
                    case 1:
                        friendlyDateString = "昨天";
                        break;
                    case 2:
                        friendlyDateString = "前天";
                        break;
                    default:
                        if (today.getFullYear() == d.getFullYear()) {
                            friendlyDateString = formatDateTime(d, "MM-dd");
                        } else {
                            friendlyDateString = formatDateTime(d, "yyyy-MM-dd");
                        }
                        break;
                }

                return friendlyDateString;
            };
        });
})();

/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global wx:false */
(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtAliyun', ['rtUtils', 'rtRestClient', function(rtUtils, rtRestClient) {
            var config;

            /**
             * 获取对应文件的URL
             */
            this.signatureUrl = function(key) {
                var client = new OSS({
                    accessKeyId: config.AccessKeyId,
                    accessKeySecret: config.AccessKeySecret,
                    bucket: config.Bucket,
                    endpoint: config.Endpoint
                });

                return client.signatureUrl(key);
            };

            function _config() {
                if (rtUtils.isNull(config)) {
                    rtRestClient.get("api/oss/GetOssConfig")
                        .success(function(result) {
                            config = result;
                        })
                        .error(function(errorMessage) {
                            console.error(errorMessage);
                        });
                }
            }

            _config();
        }]);
})();

/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global wx:false */
(function () {
    'use strict';
    angular.module('xrmApp')
        .service('rtApp', ['$http', '$ionicHistory', 'rtUtils', 'rtRestClient', 'rtWxSdk', 'rtAppSdk', function ($http, $ionicHistory, rtUtils, rtRestClient, rtWxSdk, rtAppSdk) {

            if (rtUtils.isWeixinBrowser()) {
                _.extend(this, rtWxSdk);
            } else {
                _.extend(this, rtAppSdk);
            }

            /**
             * 返回
             */
            this.goBack = function () {
                var backView = $ionicHistory.backView();

                if (backView === null) {
                    this.closeWindow();
                } else {
                    $ionicHistory.goBack();
                }
            };

            /**
             * 名片识别
             */
            this.identifyVCard = function (base64Image) {
                if (rtUtils.isNullOrEmptyString(base64Image)) {
                    throw new Error("image can not be null or empty.");
                }
                return rtRestClient.post("api/OCR/IdentifyVCard", { Image: base64Image });
            };

            /**
             * 名片识别
             */
            this.identifyIDCard = function (base64Image) {
                if (rtUtils.isNullOrEmptyString(base64Image)) {
                    throw new Error("image can not be null or empty.");
                }
                return rtRestClient.post("api/OCR/IdentifyIDCard", { Image: base64Image });
            };

            /**
             * 签名
             */
            this.signature = function ($scope, callback) {
                rtUtils.showDialog('component/signatureView.html', $scope, callback);
            };

            /**
            * 录音
            */
            this.record = function ($scope, callback) {
                rtUtils.showDialog('component/audioRecordView.html', $scope, callback);
            };
        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : East Lv
 创建时间 : 2016-06-27
 说明     : 自定义的公用服务定义
 *********************************************************/
(function() {
    'use strict';

    angular.module('xrmApp')
        .service('rtBaseService', ['rt', rtBaseService]);

    function rtBaseService(rt) {
        //
    }
})();

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtCalandar', [function() {
            this.getCalandar = function(year, month) {
                var calendar = [];

                var daynumber = GetMDay(year, month); //当月天数

                var firstnumber = WeekNumber(year, month, 1); //当月第一天星期

                var lastnumber = WeekNumber(year, month, daynumber); //当月最后一天星期

                var weeknumber = (daynumber - (7 - firstnumber) - (lastnumber + 1)) / 7; //除去第一个星期和最后一个星期的周数

                var day = 1;

                //第一个星期
                calendar.push([]);
                for (var i = 0; i < firstnumber; i++) {
                    calendar[0].push({
                        "text": "",
                        "value": null
                    });
                }
                for (var j = firstnumber; j < 7; j++) {
                    calendar[0].push({
                        "text": day < 10 ? '0' + day : '' + day,
                        "value": new Date(year, month - 1, day)
                    });
                    day++;
                }

                //其他星期
                for (var m = 1; m <= weeknumber; m++) {
                    calendar.push([]);

                    for (var k = daynumber - (7 - firstnumber) - (weeknumber - 1) * 7; k < daynumber - (7 - firstnumber) - (weeknumber - 1) * 7 + 7; k++) {
                        calendar[m].push({
                            "text": day < 10 ? '0' + day : '' + day,
                            "value": new Date(year, month - 1, day)
                        });
                        day++;
                    }
                }

                //最后一个星期
                calendar.push([]);
                for (var t = 0; t < lastnumber + 1; t++) {
                    calendar[calendar.length - 1].push({
                        "text": day < 10 ? '0' + day : '' + day,
                        "value": new Date(year, month - 1, day)
                    });
                    day++;
                }
                for (var n = lastnumber + 1; n < 7; n++) {
                    calendar[calendar.length - 1].push({
                        "text": "",
                        "value": null
                    });
                }

                return calendar;
            };

            // 给定年月获取当月天数  
            function GetMDay(y, m) {
                var mday = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

                if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) //判断是否是闰月
                {
                    mday[1] = 29;
                }

                return mday[m - 1];
            }

            // 获取星期数
            function WeekNumber(y, m, d) {
                var wk;
                if (m <= 12 && m >= 1) {
                    for (var i = 1; i < m; ++i) {
                        d += GetMDay(y, i);
                    }
                }

                /*根据日期计算星期的公式*/
                wk = (y - 1 + (y - 1) / 4 - (y - 1) / 100 + (y - 1) / 400 + d) % 7;

                //0对应星期天，1对应星期一
                return parseInt(wk);
            }
        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     :  GetData & SaveData实现
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtData', ['$http', 'rtRestClient', 'rtUtils', function($http, rtRestClient, rtUtils) {

            /**
             * 根据配置条件查询实体的数据
             * @param getDataName 配置文件中配置的查询节点的名字
             * @param paramsList 传入后端的查询条件
             * @param orderby 排序字段
             * @param pageIndex 当前页码
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             * @returns DataListModel的对象
             */
            this.queryPagingData = function(getDataName, paramsList, orderby, pageIndex, success, error) {
                rtRestClient.post("api/DataService/Query", {
                    GetDataName: getDataName,
                    Paramslist: paramsList,
                    Orderby: orderby,
                    PageSize: rtUtils.getPaginationSize(),
                    PageIndex: pageIndex
                }).success(function(dataString) {
                    var data = JSON.parse(decodeURIComponent(dataString));
                    if (success) {
                        success(data);
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };

            /**
             * 根据配置条件查询实体的数据(过滤权限)
             * @param getDataName 配置文件中配置的查询节点的名字
             * @param paramsList 传入后端的查询条件
             * @param orderby 排序字段
             * @param pageIndex 当前页码
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             * @returns DataListModel的对象
             */
            this.filteredQueryPagingData = function(getDataName, paramsList, orderby, pageIndex, success, error) {
                rtRestClient.post("api/DataService/FilteredQuery", {
                    GetDataName: getDataName,
                    Paramslist: paramsList,
                    Orderby: orderby,
                    PageSize: rtUtils.getPaginationSize(),
                    PageIndex: pageIndex
                }).success(function(dataString) {
                    var data = JSON.parse(decodeURIComponent(dataString));
                    if (success) {
                        success(data);
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };

            /**
             * 根据配置条件查询实体的数据
             * @param getDataName 配置文件中配置的查询节点的名字
             * @param paramsList 传入后端的查询条件
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             * @returns DataListModel的对象
             */
            this.queryData = function(getDataName, paramsList, success, error) {
                rtRestClient.post("api/DataService/Query", {
                    GetDataName: getDataName,
                    Paramslist: paramsList
                }).success(function(dataString) {
                    var data = JSON.parse(decodeURIComponent(dataString));
                    if (success) {
                        success(data);
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };

            /**
             * 根据配置条件查询实体的数据(过滤权限)
             * @param getDataName 配置文件中配置的查询节点的名字
             * @param paramsList 传入后端的查询条件
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             * @returns DataListModel的对象
             */
            this.filteredQueryData = function(getDataName, paramsList, success, error) {
                rtRestClient.post("api/DataService/FilteredQuery", {
                    GetDataName: getDataName,
                    Paramslist: paramsList
                }).success(function(dataString) {
                    var data = JSON.parse(decodeURIComponent(dataString));
                    if (success) {
                        success(data);
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };

            /**
             * 根据实体的Id获取实体的数据
             * @param entityName 实体的名字
             * @param id 主键字段
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             */
            this.getData = function(entityName, id, success, error) {
                rtRestClient.get("api/DataService/Get?entityName=" + entityName + "&id=" + id)
                    .success(function(dataString) {
                        var data = JSON.parse(decodeURIComponent(dataString));
                        if (success) {
                            success(data);
                        }
                    }).error(function(msg) {
                        if (error) {
                            error(msg);
                        } else {
                            rtUtils.showErrorToast(msg);
                        }
                    });
            };

            /**
             * 根据实体的Id获取实体的数据(过滤权限)
             * @param entityName 实体的名字
             * @param id 主键字段
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             */
            this.filteredGetData = function(entityName, id, success, error) {
                rtRestClient.get("api/DataService/FilteredGet?entityName=" + entityName + "&id=" + id)
                    .success(function(dataString) {
                        var data = JSON.parse(decodeURIComponent(dataString));
                        if (success) {
                            success(data);
                        }
                    }).error(function(msg) {
                        if (error) {
                            error(msg);
                        } else {
                            rtUtils.showErrorToast(msg);
                        }
                    });
            };

            /**
             * 插入或者更新实体数据
             * @param entityName 实体的名字
             * @param id 主键字段
             * @param obj 要插入数据的对象
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             */
            this.saveData = function(entityName, id, obj, success, error) {
                rtRestClient.post("api/DataService/Save", {
                    EntityName: entityName,
                    Fields: obj,
                    Id: id
                }).success(function() {
                    if (success) {
                        success();
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };

            /**
             * 删除实体数据
             * @param entityName 实体的名字
             * @param id 主键字段
             * @param success 成功后的回调函数
             * @param error 失败后的回调函数
             */
            this.deleteData = function(entityName, id, success, error) {
                rtRestClient.post("api/DataService/Delete", {
                    EntityName: entityName,
                    Id: id
                }).success(function() {
                    if (success) {
                        success();
                    }
                }).error(function(msg) {
                    if (error) {
                        error(msg);
                    } else {
                        rtUtils.showErrorToast(msg);
                    }
                });
            };
        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 封装文件上传下载部分的公用函数
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtFile', ['rtRestClient', 'rtUtils', '$q', function(rtRestClient, rtUtils, $q) {
            this.viewFile = function(moduleType, fileId, fileName) {
                var baseUrl = rtRestClient.getBaseApiUrl() + 'FileDownloadHandler.ashx?download=0&moduleType=' + moduleType + '&fileid=' + fileId;

                if (!rtUtils.isNullOrEmptyString(fileName)) {
                    var fileExt = fileName.substring(fileName.indexOf('.') + 1);
                    baseUrl += '&fileExt=' + fileExt;
                }
                window.open(baseUrl, "_self", 'toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no', true);
            };

            this.downloadFile = function(moduleType, fileId, fileName) {
                var baseUrl = rtRestClient.getBaseApiUrl() + 'FileDownloadHandler.ashx?download=1&moduleType=' + moduleType + '&fileid=' + fileId;

                if (!rtUtils.isNullOrEmptyString(fileName)) {
                    var fileExt = fileName.substring(fileName.indexOf('.') + 1);
                    baseUrl += '&fileExt=' + fileExt;
                }
                window.open(baseUrl, "_self", 'toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no', true);
            };

            this.uploadBase64File = function(fileContent, moduleType, objectId, isoverwrite, success) {
                if (rtUtils.isNullOrEmptyString(objectId)) {
                    rtUtils.showErrorToast("objectId can not be null");
                    return;
                }

                if (rtUtils.isNullOrEmptyString(fileContent)) {
                    rtUtils.showErrorToast("fileContent can not be null");
                    return;
                }

                if (rtUtils.isNull(isoverwrite)) {
                    isoverwrite = true;
                }

                var data = {
                    ObjectId: objectId,
                    IsOverWrite: isoverwrite,
                    ModuleType: moduleType,
                    FileBase64Content: fileContent
                };
                var apiUrl = "api/File/UploadFile";

                rtRestClient.post(apiUrl, data)
                    .error(function(msg) {
                        rtUtils.showErrorToast(msg);
                    })
                    .success(function(data) {
                        if (success && rtUtils.isFunction(success)) {
                            success(data);
                        }
                    });
            };

            this.getFilesByObjectId = function(moduleType, objectId) {
                var deffered = $q.defer();
                if (rtUtils.isNullOrEmptyString(moduleType)) {
                    deffered.reject("moduleType can not be null");
                    return deffered.promise;
                }

                if (rtUtils.isNullOrEmptyString(objectId)) {
                    deffered.reject("objectId can not be null");
                    return deffered.promise;
                }

                var apiUrl = "api/File/GetFilesByObjectId?moduleType=" + moduleType + "&objectId=" + objectId;
                return rtRestClient.get(apiUrl);
            };

            this.getFileByFileId = function(moduleType, fileId) {
                if (rtUtils.isNullOrEmptyString(moduleType)) {
                    rtUtils.showErrorToast("moduleType can not be null");
                    return;
                }

                if (rtUtils.isNullOrEmptyString(fileId)) {
                    rtUtils.showErrorToast("objectId can not be null");
                    return;
                }

                var apiUrl = "api/File/GetFileByFileId?moduleType=" + moduleType + "&fileId=" + fileId;
                return rtRestClient.get(apiUrl);
            };

            this.deleteFileByFileId = function(moduleType, fileId) {
                if (rtUtils.isNullOrEmptyString(moduleType)) {
                    rtUtils.showErrorToast("moduleType can not be null");
                    return;
                }
                var apiUrl = "api/File/DeleteFileByFileId?moduleType=" + moduleType + "&fileId=" + fileId;
                return rtRestClient.post(apiUrl);
            };
        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : East Lv
 创建时间 : 2016-03-10
 说明     : IonicJS & AngularJS的对象
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtLibs', ['$ionicActionSheet', '$ionicHistory', '$ionicPopover', '$ionicLoading', '$state', '$stateParams', '$rootScope', '$timeout', function($ionicActionSheet, $ionicHistory, $ionicPopover, $ionicLoading, $state, $stateParams, $rootScope, $timeout) {
            this.ionicActionSheet = $ionicActionSheet;
            this.ionicHistory = $ionicHistory;
            this.ionicPopover = $ionicPopover;
            this.ionicLoading = $ionicLoading;

            this.state = $state;
            this.stateParams = $stateParams;
            this.timeout = $timeout;
            this.rootScope = $rootScope;
        }]);
})();

/**
 * Created by Edgar dong on 2016/6/7.
 */

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtMd5', [function() {
            /*
             * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
             * Digest Algorithm, as defined in RFC 1321.
             * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
             * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
             * Distributed under the BSD License
             * See http://pajhome.org.uk/crypt/md5 for more info.
             */

            /*
             * Configurable variables. You may need to tweak these to be compatible with
             * the server-side, but the defaults work in most cases.
             */
            var hexcase = 0;
            /* hex output format. 0 - lowercase; 1 - uppercase        */
            var b64pad = "";
            /* base-64 pad character. "=" for strict RFC compliance   */
            var chrsz = 8;
            /* bits per input character. 8 - ASCII; 16 - Unicode      */

            /*
             * These are the functions you'll usually want to call
             * They take string arguments and return either hex or base-64 encoded strings
             */
            this.md5 = function hex_md5(s) {
                return binl2hex(core_md5(str2binl(s), s.length * chrsz));
            };

            function b64_md5(s) {
                return binl2b64(core_md5(str2binl(s), s.length * chrsz));
            }

            function str_md5(s) {
                return binl2str(core_md5(str2binl(s), s.length * chrsz));
            }

            function hex_hmac_md5(key, data) {
                return binl2hex(core_hmac_md5(key, data));
            }

            function b64_hmac_md5(key, data) {
                return binl2b64(core_hmac_md5(key, data));
            }

            function str_hmac_md5(key, data) {
                return binl2str(core_hmac_md5(key, data));
            }

            /*
             * Perform a simple self-test to see if the VM is working
             */
            function md5_vm_test() {
                return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
            }

            /*
             * Calculate the MD5 of an array of little-endian words, and a bit length
             */
            function core_md5(x, len) {
                /* append padding */
                x[len >> 5] |= 0x80 << ((len) % 32);
                x[(((len + 64) >>> 9) << 4) + 14] = len;

                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;

                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;

                    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return Array(a, b, c, d);

            }

            /*
             * These functions implement the four basic operations the algorithm uses.
             */
            function md5_cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }

            function md5_ff(a, b, c, d, x, s, t) {
                return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }

            function md5_gg(a, b, c, d, x, s, t) {
                return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }

            function md5_hh(a, b, c, d, x, s, t) {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }

            function md5_ii(a, b, c, d, x, s, t) {
                return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
            }

            /*
             * Calculate the HMAC-MD5, of a key and some data
             */
            function core_hmac_md5(key, data) {
                var bkey = str2binl(key);
                if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

                var ipad = Array(16),
                    opad = Array(16);
                for (var i = 0; i < 16; i++) {
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }

                var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
                return core_md5(opad.concat(hash), 512 + 128);
            }

            /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally
             * to work around bugs in some JS interpreters.
             */
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }

            /*
             * Bitwise rotate a 32-bit number to the left.
             */
            function bit_rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }

            /*
             * Convert a string to an array of little-endian words
             * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
             */
            function str2binl(str) {
                var bin = Array();
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < str.length * chrsz; i += chrsz)
                    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
                return bin;
            }

            /*
             * Convert an array of little-endian words to a string
             */
            function binl2str(bin) {
                var str = "";
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < bin.length * 32; i += chrsz)
                    str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
                return str;
            }

            /*
             * Convert an array of little-endian words to a hex string.
             */
            function binl2hex(binarray) {
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                        hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
                }
                return str;
            }

            /*
             * Convert an array of little-endian words to a base-64 string
             */
            function binl2b64(binarray) {
                var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i += 3) {
                    var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
                    for (var j = 0; j < 4; j++) {
                        if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
                        else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
                    }
                }
                return str;
            }

        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 用户操作权限相关的帮助类
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtPrivilege', ['$http', 'rtRestClient', function($http, rtRestClient) {

            /**
             * 获取权限
             * @param {string} etn 实体名称
             * @param {string} id 单据名称
             * @param  type     权限类型
             * @returns {HttpPromise}
             */
            this.havePrivilege = function(etn, id, type) {
                var url = "api/privilege/GetPrivilegeByType?etn=" + etn + "&type=" + type;
                if (id !== null) {
                    url += "&id=" + id;
                }
                return rtRestClient.get(url);
            };
        }]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 请求WebApi的帮助函数
 *********************************************************/
/*global angular*/

(function() {
    'use strict';
    angular.module('xrmApp')
        .service('rtRestClient', ['$http', '$q', 'rtUtils', function($http, $q, rtUtils) {
            var _this = this;

            function _setupHttpHeader($http) {
                var token = _this.getXrmAuthToken();
                if (!rtUtils.isNullOrEmptyString(token)) {
                    $http.defaults.headers.common.Authorization = 'Bearer ' + token;
                }

                var appName = _getAppName();
                if (!rtUtils.isNullOrEmptyString(appName)) {
                    $http.defaults.headers.common["app"] = appName;    // jshint ignore:line
                }

                var languageCode = rtUtils.getLanguageCode();
                if (!rtUtils.isNullOrEmptyString(languageCode)) {
                    $http.defaults.headers.common["Accept-Language"] = languageCode;
                }
            }

            function _setupPromise(httpPromise) {

                var deferred = $q.defer();

                httpPromise
                    .then(function(response) {
                        var data = response.data;

                        if (!rtUtils.isNull(data) && !rtUtils.isNull(data.ErrorCode)) {
                            if (data.ErrorCode === 0) {
                                deferred.resolve({
                                    data: data.Data,
                                    message: data.Message
                                });
                            } else {
                                deferred.reject({
                                    code: data.ErrorCode,
                                    message: data.Message
                                });
                            }
                        } else {
                            deferred.resolve({
                                data: data,
                                message: ""
                            });
                        }
                    }, function(response) {
                        deferred.reject({
                            code: response.status,
                            message: response.data
                        });
                    });

                var promise = deferred.promise;

                promise.success = function(fn) {
                    this.then(function(resp) {
                        if (!fn) {
                            return;
                        }

                        fn(resp.data, resp.message);
                    });
                    return this;
                };

                promise.error = function(fn) {
                    this.then(null, function(resp) {
                        if (!fn) {
                            return;
                        }

                        fn(resp.message, resp.code);
                    });
                    return this;
                };

                return promise;
            }

            function _getAppName() {
                return localStorage.Wechat_AppName;
            }

            /**
             * 获取移动接口服务器的地址
             */
            this.getBaseApiUrl = function() {
                var url = null;
                if (window.XrmDeviceData && window.XrmDeviceData.getXrmBaseUrl) {
                    url = window.XrmDeviceData.getXrmBaseUrl();
                } else if (!rtUtils.isNullOrEmptyString(localStorage.XrmBaseUrl)) {
                    url = localStorage.XrmBaseUrl;
                }

                if (url === null) {
                    url = "../";
                }

                if (!url.endWith("/")) {
                    url += "/";
                }

                return url;
            };

            /**
             * 获取当前用户的身份Token
             */
            this.getXrmAuthToken = function() {
                if (window.XrmDeviceData && window.XrmDeviceData.getXrmAuthToken) {
                    return window.XrmDeviceData.getXrmAuthToken();
                } else if (!rtUtils.isNullOrEmptyString(localStorage.XrmAuthToken)) {
                    return localStorage.XrmAuthToken;
                }

                var appName = _getAppName();
                if (!rtUtils.isNullOrEmptyString(appName)) {
                    return localStorage["Wechat_" + appName + "_AuthToken"];
                }

                return null;
            };

            /**
             * 通过Get方法调用WebAPI
             * @param {string} apiUrl WebAPI的URL地址
             * @returns {HttpPromise}
             */
            this.get = function(apiUrl, ignoreError) {
                var url = this.getBaseApiUrl() + apiUrl;

                _setupHttpHeader($http);

                return _setupPromise($http.get(url));
            };

            /**
             * 通过post的方法调用WebAPI
             * @param {string} apiUrl WebAPI的URL地址
             * @param {*} data 要post到服务器端的数据
             * @returns {HttpPromise}
             */
            this.post = function(apiUrl, data) {
                var url = this.getBaseApiUrl() + apiUrl;

                _setupHttpHeader($http);

                return _setupPromise($http.post(url, data));
            };

            this.delete = function(apiUrl) {
                var url = this.getBaseApiUrl() + apiUrl;

                _setupHttpHeader($http);

                return _setupPromise($http.delete(url));
            };

            /**
             * 通过post的方法调用WebAPI
             * @param {string} apiUrl WebAPI的URL地址
             * @param {*} data 要post到服务器端的数据
             * @returns {HttpPromise}
             */
            this.put = function(apiUrl, data) {
                var url = this.getBaseApiUrl() + apiUrl;

                _setupHttpHeader($http);

                return _setupPromise($http.put(url, data));
            };
        }]);
})();
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     :  将所有的公用函数库合并到rt对象中
 *********************************************************/
/*global angular*/
/*global _*/

(function () {
    'use strict';
    angular.module('xrmApp')
        .service('rt', ['rtLibs', 'rtMd5', 'rtCalandar', 'rtUtils', 'rtRestClient', 'rtApp', 'rtData', 'rtFile',
            function (rtLibs, rtMd5, rtCalandar, rtUtils, rtRestClient, rtApp, rtData, rtFile) {
                _.extend(this, rtLibs, rtMd5, rtCalandar, rtUtils, rtRestClient, rtApp, rtData, rtFile);
            }
        ]);
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : joe Song
 创建时间 : 2016-03-10
 说明     : 常用帮助函数，如是否是手机号等
 *********************************************************/
/*global angular*/
/*global BMap*/

(function () {
    'use strict';
    angular.module('xrmApp')
        .service('rtUtils', ['$rootScope', '$http', '$ionicLoading', '$filter', '$ionicModal', '$ionicPopup', '$ionicViewService', '$timeout', '$ionicHistory', '$ionicActionSheet', '$state', '$translate', '$injector', '$q',
            function ($rootScope, $http, $ionicLoading, $filter, $ionicModal, $ionicPopup, $ionicViewService, $timeout, $ionicHistory, $ionicActionSheet, $state, $translate, $injector, $q) {
                /**
                 * 判断一个字符串是不是以某字符串开头
                 * @param s
                 * @returns {boolean} 如果是，则返回true，否则返回 false
                 */
                String.prototype.startWith = function (s, ignoreCase) {
                    if (s === null || s === "" || this.length === 0 || s.length > this.length) {
                        return false;
                    }
                    var ns = this.substr(0, s.length);
                    if (ignoreCase) {
                        return ns.toLowerCase() === s.toLowerCase();
                    } else {
                        return ns === s;
                    }
                };

                /**
                 * 判断一个字符串是否包含某字符串
                 * @param substr 包含的字符串
                 * @param ignoreCase 是否忽略大小写
                 * @returns {boolean} 如果包含，则返回true，否则返回 false
                 */
                String.prototype.contains = function (substr, ignoreCase) {
                    if (ignoreCase === null || ignoreCase === undefined) {
                        ignoreCase = false;
                    }

                    if (ignoreCase) {
                        return this.search(new RegExp(substr, "i")) > -1;
                    } else {
                        return this.search(substr) > -1;
                    }
                };

                /**
                 * 判断一个字符串是不是以某字符串结尾
                 * @param s
                 * @returns {boolean} 如果是，则返回true，否则返回 false
                 */
                String.prototype.endWith = function (s, ignoreCase) {
                    if (s === null || s === "" || this.length === 0 || s.length > this.length) {
                        return false;
                    }
                    var ns = this.substring(this.length - s.length);
                    if (ignoreCase) {
                        return ns.toLowerCase() === s.toLowerCase();
                    } else {
                        return ns === s;
                    }
                };

                /**
                 * 判断一个变量是否是undefined或者null
                 * @param o 需要进行判断的变量
                 * @returns {boolean} 如果是undified或者null，则返回true，否则返回 false
                 */
                this.isNull = function (o) {
                    return o === undefined || o === null;
                };

                /**
                 * 判断一个字符串是否是undified、null、“”
                 * @param s 字符串变量
                 * @returns {boolean} 如果是，则返回true，否则返回false
                 */
                this.isNullOrEmptyString = function (s) {
                    return this.isNull(s) || this.trim(s) === "";
                };

                /**
                 * 判断是否是日期类型
                 * @param d
                 * @returns {boolean}
                 */
                this.isDate = function (d) {
                    if (this.isNull(d)) {
                        return false;
                    }

                    return d instanceof Date && !isNaN(d.valueOf());
                };

                /**
                 * 判断变量f是否是一个函数
                 * @param f 变量f
                 * @returns {boolean} 如果是函数则返回true，否则返回false
                 */
                this.isFunction = function (f) {
                    if (this.isNull(f)) {
                        return false;
                    }

                    return typeof f === 'function';
                };

                /**
                 * 判断字符是否有效的手机号码
                 * @returns {boolean}
                 */
                this.isCellphone = function (str) {
                    var reg = /^0*(13|15|18)\d{9}$/;
                    return reg.test(str);
                };

                /**
                 * 判断字符是否有效的电话号码
                 * @returns {boolean}
                 */
                this.isTelephone = function (str) {
                    var reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/;
                    return reg.test(str);
                };

                /**
                 * 检查是否是手机号码或者电话号码
                 */
                this.isPhone = function (str) {
                    return this.isCellphone(str) || this.isTelephone(str);
                };

                /**
                 * 检查是否是邮件地址
                 */
                this.isEMailAddress = function (str) {
                    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;

                    return reg.test(str);
                };

                /**
                 * 判断字符是否有效的身份证号码
                 * @returns {boolean}
                 */
                this.isIDCard = function (str) {
                    var reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
                    return reg.test(str);
                };

                /** 
                 * 判断是否微信浏览器
                */
                this.isWeixinBrowser = function () {
                    return typeof WeixinJSBridge !== "undefined" || /micromessenger/i.test(navigator.userAgent);;
                };

                /**
                 * 得到日期年月日等加数字后的日期
                 */
                Date.prototype.dateAdd = function (datepart, number) {
                    var d = new Date(this.getTime());

                    var k = {
                        'y': 'FullYear',
                        'q': 'Month',
                        'm': 'Month',
                        'w': 'Date',
                        'd': 'Date',
                        'h': 'Hours',
                        'n': 'Minutes',
                        's': 'Seconds',
                        'ms': 'MilliSeconds'
                    };
                    var n = { 'q': 3, 'w': 7 };
                    eval('d.set' + k[datepart] + '(d.get' + k[datepart] + '()+' + ((n[datepart] || 1) * number) + ')'); // jshint ignore:line
                    return d;
                };

                /**
                 * 计算两日期相差的日期年月日等
                 */
                Date.prototype.dateDiff = function (datepart, enddate) {
                    /* jshint ignore:start */
                    var d = this,
                        i = {},
                        t = d.getTime(),
                        t2 = enddate.getTime();
                    i['y'] = enddate.getFullYear() - d.getFullYear();
                    i['q'] = i['y'] * 4 + Math.floor(enddate.getMonth() / 4) - Math.floor(d.getMonth() / 4);
                    i['m'] = i['y'] * 12 + enddate.getMonth() - d.getMonth();
                    i['ms'] = enddate.getTime() - d.getTime();
                    i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
                    i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
                    i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
                    i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
                    i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
                    return i[datepart];
                    /* jshint ignore:end */
                };

                /**
                 * 得到日期年月日等加数字后的日期
                 */
                this.dateAdd = function (datepart, number, date) {
                    return date.dateAdd(datepart, number);
                };

                /**
                 * 计算两日期相差的日期年月日等
                 */
                this.dateDiff = function (datepart, startdate, enddate) {
                    return startdate.dateDiff(datepart, enddate);
                };

                String.prototype.trim = function (trimChars) {
                    var result = this;

                    if (typeof trimChars !== "string" || trimChars.length <= 0) {
                        trimChars = " ";
                    }

                    var count = result.length;

                    while (count > 0) { //trim the head position
                        if (trimChars.indexOf(result[0]) >= 0) {
                            result = result.substring(1);
                            count--;
                        } else {
                            break;
                        }
                    }
                    while (count > 0) { //trim the tail position
                        if (trimChars.indexOf(result[count - 1]) >= 0) {
                            result = result.substring(0, count - 1);
                            count--;
                        } else {
                            break;
                        }
                    }
                    return result;
                };

                /**
                 * 移除字符串前后的空格或其它特殊字符，同C#中的Trim方法。
                 * @param str 待trim的字符串
                 * @param trimChars 要移除的特殊字符，如果不指定，则默认移除空白字符
                 * @returns {string} 返回移除后的字符串
                 */
                this.trim = function (str, trimChars) {
                    if (this.isNull(str) || typeof str !== "string" || str.length <= 0) {
                        return "";
                    }

                    return str.trim(trimChars);
                };

                /**
                 * 格式化日期类型
                 * @param {Date} date  待格式化的日期
                 * @param {string} format 语法同C#，默认”yyyy-MM-dd”
                 * @returns {string} 返回格式化后的日期字符串
                 */
                this.formatDateTime = function (date, format) {
                    if (!this.isDate(date)) {
                        return "";
                    }
                    if (this.isNullOrEmptyString(format)) {
                        format = 'yyyy-MM-dd';
                    }
                    return $filter('date')(date, format);
                };

                /**
                 * 生成一个新的GUID
                 * @returns {string} GUID
                 */
                this.newGuid = function () {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }

                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                };

                /**
                 * 延迟执行
                 * @param {string} action 执行动作
                 * @param {int} delayMilliseconds 延迟的时间，单位：毫秒
                 */
                this.delay = function (action, delayMilliseconds) {
                    if (!this.isFunction(action)) {
                        throw new Error("第一个参数必须是function对象.");
                    }

                    if (this.isNull(delayMilliseconds)) {
                        delayMilliseconds = 2 * 1000;
                    }

                    $timeout(action, delayMilliseconds);
                };

                /**
                 * 分页查询时，获取每页显示的记录数。
                 */
                this.getPaginationSize = function () {
                    return 10;
                };

                /**
                 * 获取当前用户的ID
                 * @returns {string} 当前人员ID
                 */
                this.getUserId = function () {
                    var userId;
                    if (window.XrmDeviceData && window.XrmDeviceData.getUserId) {
                        userId = window.XrmDeviceData.getUserId();
                    } else if (!this.isNullOrEmptyString(localStorage.UserId)) {
                        userId = localStorage.UserId;
                    } else {
                        this.showErrorToast("没有获取到当前用户的ID!");
                    }
                    return userId;
                };

                /**
                 * 获取当前用户的类型
                 * @returns {string} 当前人员类型
                 */
                this.getUserType = function () {
                    var userType;
                    if (window.XrmDeviceData && window.XrmDeviceData.getUserType) {
                        userType = window.XrmDeviceData.getUserType();
                    } else if (!this.isNullOrEmptyString(localStorage.UserType)) {
                        userType = localStorage.UserType;
                    } else {
                        this.showErrorToast("没有获取到当前用户的类型!");
                    }
                    return userType;
                };

                /**
                 * 获取当前用户的账号
                 * @returns {string} 当前人员账号
                 */
                this.getUserName = function () {
                    var userName;
                    if (window.XrmDeviceData && window.XrmDeviceData.getUserName) {
                        userName = window.XrmDeviceData.getUserName();
                    } else if (!this.isNullOrEmptyString(localStorage.UserName)) {
                        userName = localStorage.UserName;
                    } else {
                        this.showErrorToast("没有获取到当前用户的账号!");
                    }
                    return userName;
                };


                /**
                 * 设置语言
                 * @param {string} 语言编码，如zh-CN、en-US
                 */
                this.setLanguageCode = function (languageCode) {
                    localStorage.LanguageCode = languageCode;
                    $translate.use(languageCode);
                };

                /**
                 * 获取语言
                 * @returns {string} 语言编码，如zh-CN、en-US
                 */
                this.getLanguageCode = function () {
                    var languageCode;

                    if (window.XrmDeviceData && window.XrmDeviceData.getLanguageCode) {
                        languageCode = window.XrmDeviceData.getLanguageCode();
                    } else if (localStorage.LanguageCode !== null && localStorage.LanguageCode !== undefined && localStorage.LanguageCode !== "") {
                        languageCode = localStorage.LanguageCode;
                    } else {
                        languageCode = "zh-CN";
                    }

                    return languageCode;
                };

                /**
                 * 翻译文字
                 * @param {string} word 语言词条
                 * @returns {string} 翻译后的文字
                 */
                this.translate = function (word) {
                    return $filter('translate')(word);
                };

                /**
                 * 弹出提示的Toast
                 * @param {string} msg 提示信息
                 * @param {int} duration 持续时间
                 */
                this.showInfoToast = function (msg, duration) {
                    if (this.isNullOrEmptyString(msg)) {
                        return;
                    }

                    $ionicLoading.show({
                        template: '<div>' +
                            '<div class="weui_mask_transparent"></div>' +
                            '<div class="weui_toast">' +
                            '<i class="weui_icon_toast_information"></i>' +
                            '<p class="weui_toast_content">' + msg + '</p>' +
                            '</div>' +
                            '</div>',
                        duration: duration || 1500
                    });
                };

                /**
                 * 弹出操作执行成功的Toast
                 * @param {string} msg 提示信息
                 * @param {int} duration 持续时间
                 */
                this.showSuccessToast = function (msg, duration) {
                    if (this.isNullOrEmptyString(msg)) {
                        return;
                    }

                    $ionicLoading.show({
                        template: '<div>' +
                            '<div class="weui_mask_transparent"></div>' +
                            '<div class="weui_toast">' +
                            '<i class="weui_icon_toast"></i>' +
                            '<p class="weui_toast_content">' + msg + '</p>' +
                            '</div>' +
                            '</div>',
                        duration: duration || 1500
                    });
                };

                /**
                 * 弹出执行错误的Toast
                 * @param {string} msg 错误消息
                 * @param {int} duration 持续时间
                 */
                this.showErrorToast = function (msg, duration) {
                    if (this.isNullOrEmptyString(msg)) {
                        return;
                    }

                    $ionicLoading.show({
                        template: '<div>' +
                            '<div class="weui_mask_transparent"></div>' +
                            '<div class="weui_toast">' +
                            '<i class="weui_icon_toast_error"></i>' +
                            '<p class="weui_toast_content">' + msg + '</p>' +
                            '</div>' +
                            '</div>',
                        duration: duration || 1500
                    });
                };

                /**
                 * 弹出正在执行的Toast
                 * @param {string} msg 提示信息
                 */
                this.showLoadingToast = function (msg) {
                    if (this.isNullOrEmptyString(msg)) {
                        msg = this.translate("component_Loading");
                    }

                    $ionicLoading.show({
                        template: '<div class="weui_loading_toast">' +
                            '<div class="weui_mask_transparent"></div>' +
                            '<div class="weui_toast">' +
                            '<div class="weui_loading">' +
                            '<div class="weui_loading_leaf weui_loading_leaf_0"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_1"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_2"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_3"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_4"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_5"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_6"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_7"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_8"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_9"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_10"></div>' +
                            '<div class="weui_loading_leaf weui_loading_leaf_11"></div>' +
                            '</div>' +
                            '<p class="weui_toast_content">' + msg + '</p>' +
                            '</div>' +
                            '</div>',
                        duration: 0,
                        noBackdrop: true
                    });
                };

                /**
                 * 隐藏正在执行的消息提示框
                 */
                this.hideLoadingToast = function () {
                    $ionicLoading.hide();
                };

                /**
                 * 创建弹出的对话框页面，如lookup的选择也
                 * @param {string} url 对话框模板html文件的地址
                 * @param {$scope} $s angularjs的$scope对象
                 * @param {function} cb 对话框的执行完成的回掉函数，如点击OK按钮或者选择一行数据
                 * @returns {promise} 返回promise对象，需要在then方法中调用show方法显示对话框，如then(function(d){ d.show();});
                 */
                this.createDialog = function (url, $s, cb) {
                    return $ionicModal.fromTemplateUrl(url, function ($ionicModal) {
                        $s.dialog = $ionicModal;
                        $s.closeDialog = function () {
                            $s.dialog.remove();
                        };
                        if (cb !== undefined) {
                            $s.onDataSelected = cb;
                        }
                    }, {
                            scope: $s,
                            animation: 'slide-in-up'
                        });
                };

                /**
                 * 弹出的对话框页面，如lookup的选择
                 * @param {string} templateUrl 对话框模板html文件的地址
                 * @param {$scope} $scope angularjs的$scope对象
                 * @param {function} callback 对话框的执行完成的回调函数，如点击OK按钮或者选择一行数据
                 */
                this.showDialog = function (templateUrl, $scope, callback) {
                    $ionicModal.fromTemplateUrl(templateUrl, function ($ionicModal) {
                        $scope.dialog = $ionicModal;
                        $scope.closeDialog = function () {
                            $scope.dialog.remove();
                            $rootScope.$broadcast('xrm.modal.hidden', $ionicModal);
                        };

                        if (callback !== undefined) {
                            $scope.onDataSelected = callback;
                        }
                    }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (d) {
                            d.show();
                            $rootScope.$broadcast('xrm.modal.shown', d);
                        });
                };

                /**
                 * 弹出提示对话框
                 * @param {String} title 消息提示的标题
                 * @param {String} content 消息提示的正文
                 * @param {string} okText 确定按钮的显示文字
                 */
                this.showAlertDialog = function (config) {
                    if (this.isNull(config)) {
                        config = {};
                    }

                    return $ionicPopup.alert({
                        title: config.title || "",
                        template: '<div style="text-align:center;">' + (config.content || "") + '</div>',
                        okText: config.okText || this.translate('component_OK'),
                        okType: "rt-dialog-button-primary"
                    });
                };

                /**
                 * 弹出提示对话框
                 * @param {String} title 消息提示的标题
                 * @param {String} content 消息提示的正文
                 */
                this.alert = function (title, content) {
                    return this.showAlertDialog({
                        "title": title,
                        "content": content
                    });
                };

                /**
                 * 弹出确认选择的对话框，如：是否要删除，包含确认和取消两个按钮
                 * @param {string} title 消息提示的标题
                 * @param {string} content 消息提示的正文
                 * @param {string} cancelText 取消按钮的显示文字
                 * @param {string} okText 确定按钮的显示文字
                 */
                this.showConfirmDialog = function (config) {
                    if (this.isNull(config)) {
                        config = {};
                    }

                    return $ionicPopup.confirm({
                        title: config.title || "",
                        content: config.content || "",
                        cancelText: config.cancelText || this.translate('component_Cancel'),
                        okText: config.okText || this.translate('component_OK'),
                        okType: "rt-dialog-button-primary"
                    });
                };

                /**
                 * 弹出确认选择的对话框，如：是否要删除，包含确认和取消两个按钮
                 * @param {string} title 消息提示的标题
                 * @param {string} content 消息提示的正文
                 */
                this.confirm = function (title, content) {
                    var deferred = $q.defer();

                    this.showConfirmDialog({
                        "title": title,
                        "content": content
                    }).then(function (res) {
                        if (res) {
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                };

                this.getUrlParam = function (name) {
                    try {
                        var query = location.search.substring(1);
                        var pairs = query.split("&");
                        for (var i = 0; i < pairs.length; i++) {
                            var pos = pairs[i].indexOf('=');
                            if (pos == -1) continue;
                            var argname = pairs[i].substring(0, pos);
                            if (argname == name)
                                return pairs[i].substring(pos + 1);
                        }
                    } catch (e) {
                        alert(e);
                    }
                    return '';
                };

                this.getUrlParamFromHash = function (name) {
                    var hash = location.hash;
                    var query = hash.substring(hash.indexOf('?') + 1);
                    var pairs = query.split("&");
                    for (var i = 0; i < pairs.length; i++) {
                        var pos = pairs[i].indexOf('=');
                        if (pos === -1) {
                            continue;
                        }
                        var paramName = pairs[i].substring(0, pos);
                        if (paramName === name) {
                            return pairs[i].substring(pos + 1);
                        }
                    }

                    return '';
                };

                this.convertGps2BaiduCoordinates = function (longitude, latitude) {
                    var url = "http://api.map.baidu.com/geoconv/v1/?coords=" + longitude + "," + latitude + "&from=1&to=5&ak=ROninBdEIu93CBGDHc3fSPHE&callback=JSON_CALLBACK";

                    return $http.jsonp(url);
                };

                this.convertGps2MarsCoordinates = function (longitude, latitude) {
                    var url = "http://restapi.amap.com/v3/assistant/coordinate/convert?key=04bdceb300cf826bc9a1dcf0e095246a&coordsys=gps&locations=" + longitude + "," + latitude + "&callback=JSON_CALLBACK";;
                    return $http.jsonp(url);
                }

                this.inverseGeocoding = function (longitude, latitude) {
                    var url = "http://restapi.amap.com/v3/geocode/regeo?key=04bdceb300cf826bc9a1dcf0e095246a&location=" + longitude + "," + latitude + "&callback=JSON_CALLBACK";;
                    return $http.jsonp(url);
                }

                this.extendController = function (childController, params) {
                    params.rt = this;

                    $injector.invoke(rtBaseController, childController, params);

                    return childController;
                };

                this.extendListController = function (childController, params) {
                    params.rt = this;

                    $injector.invoke(rtListController, childController, params);

                    return childController;
                };

                this.createCascadePickerDialog = function (config) {
                    var $scope = config.scope;

                    if (this.isNull($scope.cascadePicker)) {
                        $scope.cascadePicker = {};
                    }
                    $scope.cascadePicker.title = config.title || '';
                    $scope.cascadePicker.dataProvider = config.dataProvider || [];
                    $scope.cascadePicker.selectedValue = config.selectedValue || [];
                    $scope.cascadePicker.success = config.success;
                    $scope.cascadePicker.close = function () {
                        this.modal.hide();
                    };

                    return $ionicModal.fromTemplateUrl('component/cascadePickerDialog.html', function (ionicModal) {
                        $scope.cascadePicker.modal = ionicModal;
                    }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        });
                };

                this.getScreenWidth = function () {
                    return document.documentElement.clientWidth || document.body.clientWidth;
                };

                this.getScreenHeight = function (containHeader) {
                    return document.documentElement.clientHeight || document.body.clientHeight;
                };

                this.showDatePickerDialog = function (config) {
                    var $scope = config.scope;

                    if (this.isNull($scope.datePicker)) {
                        $scope.datePicker = {};
                    }
                    $scope.datePicker.selectedValue = config.selectedValue;
                    $scope.datePicker.success = config.success;
                    $scope.datePicker.close = function () {
                        this.modal.hide();
                    };

                    return $ionicModal.fromTemplateUrl('component/datePickerDialog.html', function (ionicModal) {
                        $scope.datePicker.modal = ionicModal;
                    }, {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (d) {
                            d.show();
                        });
                };
            }
        ]);
})();
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2017-02-06
 说明     : Badge插件
 *********************************************************/
/*global angular*/
angular.module('xrmApp')
    .directive('rtBadge', ['rt', function (rt) {
        'use strict';
        return {
            restrict: "E",
            scope: false,
            replace: true,
            template: function (element, attrs) {
                if (!angular.isDefined(attrs.rtNumber)) {
                    return '<span class="rt-badge-spot"></span>';
                } else {
                    return '<span class="rt-badge">' + attrs.rtNumber + '</span>';
                }
            }
        };
    }]);

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2016-03-10
 说明     :  当没有数据时显示的空白图片
 *********************************************************/
/*global angular*/

angular.module('xrmApp')
    .directive('rtEmptyView', function() {
        "use strict";
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: false,
            template: function(element, attrs) {
                return '<div ng-if="!' + attrs.rtRelatedModel + ' ||' + attrs.rtRelatedModel + '.length===0" class="rt-empty-view">' +
                    '    <div>' +
                    '        <img src="component/img/empty.png" />' +
                    '        <p>' + attrs.rtMessage + '</p>' +
                    '    </div>' +
                    '</div>';
            }
        };
    });

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2016-10-20
 说明     : 可展开的控件
 *********************************************************/
/*global angular*/

angular.module('xrmApp')
    .directive('rtExpandable', function() {
        "use strict";
        return {
            restrict: 'A',
            scope: {
                rtOnExpand: "&",
                rtOnCollapse: "&"
            },
            controller: function($scope, $element) {
                var headerElement, bodyElement;

                this.setHeaderElement = function(element) {
                    headerElement = element;

                    headerElement.bind("click", function() {
                        var expanded = bodyElement.css('display') === "none";
                        bodyElement.css("display", expanded ? "block" : "none");

                        $scope.$expanded = expanded;

                        if(expanded){
                            if($scope.rtOnExpand){
                                $scope.rtOnExpand();
                            }
                        }else{
                            if($scope.rtOnCollapse){
                                $scope.rtOnCollapse();
                            }   
                        }

                        $scope.$apply();
                    });
                };

                this.setBodyElement = function(element) {
                    bodyElement = element;

                    if (bodyElement.css("display") === "") {
                        bodyElement.css("display", "none");
                    }

                    $scope.$expanded = bodyElement.css('display') === "block";
                };
            }
        };
    })
    .directive('rtExpandHeader', function() {
        "use strict";
        return {
            restrict: 'A',
            require: '^rtExpandable',
            link: function($scope, $element, $attrs, $ctrl) {
                $ctrl.setHeaderElement($element);
            },
        };
    })
    .directive('rtExpandBody', function() {
        "use strict";
        return {
            restrict: 'A',
            require: '^rtExpandable',
            link: function($scope, $element, $attrs, $ctrl) {
                $ctrl.setBodyElement($element);
            }
        };
    });

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2016-03-10
 说明     : 高级查找的过滤视图
 *********************************************************/
/*global angular:false */

(function(window, document, undefined) {
    'use strict';
    angular.module('xrmApp')
        .directive('rtFilterContainer', ['rt', function(rt) {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {
                    rtVisible: "=",
                    rtOnReset: "&",
                    rtOnSearch: "&"
                },
                template: '<div ng-show="rtVisible" class="rt-filter-view">' +
                    '    <div class="_mask" ng-click="hideFilterView()"></div>' +
                    '    <div class="_content" ng-transclude></div>' +
                    '    <div class="_footer">' +
                    '        <button class="button button-clear button-positive" style="width:50%;" ng-click="rtOnReset()">' +
                    '           {{ "component_Reset" | translate }}' +
                    '       </button>' +
                    '        <button class="button button-clear button-positive" style="width:50%;float:right;" ng-click="doFilter()">' +
                    '           {{ "component_Search" | translate }}' +
                    '       </button>' +
                    '    </div>' +
                    '</div>',
                link: function(scope, element, attrs, ngModelCtrl) {
                    function _hideFilterView() {
                        scope.rtVisible = false;
                    }

                    scope.hideFilterView = _hideFilterView;

                    scope.doFilter = function() {
                        _hideFilterView();
                        scope.rtOnSearch();
                    };
                }
            };
        }])
        .directive('rtFilterView', function() {
            return {
                restrict: 'E',
                replace: true,
                require: 'ngModel',
                transclude: true,
                scope: {},
                template: '<div>' + '</div>',
                link: function(scope, element, attrs, ngModelCtrl) {
                    //
                }
            };
        });
})(window, document);

/********************************************************
Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved. 
 创建人   : east lv
 创建时间 : 2016-03-10
 说明     : 自动设置焦点的Directive
*********************************************************/

angular.module('xrmApp')
    .directive('focusOn', function() {
        return function(scope, element, attr) {
            scope.$on('focusOn', function(e, name) {
                if (name === attr.focusOn) {
                    element[0].focus();
                }
            });
        };

    }).factory('focus', function($rootScope, $timeout) {
        return function(name) {
            $timeout(function() {
                $rootScope.$broadcast('focusOn', name);
            });
        };
    });

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2016-05-12
 说明     : 表单输入组件
 *********************************************************/
/*global angular:false */

(function (window, document, undefined) {
    'use strict';

    angular.module('xrmApp')
        /*-------   表单   -------*/
        .directive('rtForm', function () {
            return {
                restrict: 'E',
                scope: {
                    rtTextAlign: "@"
                },
                replace: true,
                //transclude: true,
                //template: '<div class="rt-form" ng-transclude></div>',
                compile: function ($element, $attr) {
                    $element.addClass("rt-form");
                },
                controller: function ($scope, $element) {
                    this.textAlign = angular.isDefined($scope.rtTextAlign) ? $scope.rtTextAlign : "left";
                }
            };
        })
        /*-------   标签 + 文本   -------*/
        .directive('rtFormRowText', function () {
            return {
                restrict: 'EA',
                scope: {
                    rtLabel: "@",
                    rtText: "@"
                },
                replace: true,
                //require: '^rtForm',
                template: '<div class="rt-form-row rt-form-row-readonly">' +
                    '    <span class="_input-label">{{rtLabel}}</span>' +
                    '    <span class="_input-readonly">{{rtText}}</span>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var inputEl = $element.children()[1];
                    inputEl.style.textAlign = "left";//$ctrl.textAlign;
                }
            };
        })
        /*-------   标签 + 文本   -------*/
        .directive('rtFormRow2Text', function () {
            return {
                restrict: 'EA',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtText: "@"
                },
                template: '<div class="rt-form-row-2 rt-form-row-readonly">' +
                    '    <span class="_input-label">{{rtLabel}}</span>' +
                    '    <span class="_input-readonly">{{rtText}}</span>' +
                    '</div>'
            };
        })
        /*-------   标签 + 输入   -------*/
        .directive('rtFormRowInput', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                //require: '^rtForm',
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtType: "@",
                    rtFocusOn: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: '='
                },
                template: '<div class="rt-form-row rt-form-row-input">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" style="color: red;"> *</span></label>' +
                    '    <input class="_input-text" ng-disabled="rtDisabled" ng-model="rtModel" focus-on="{{rtFocusOn}}" />' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var type = $attr.rtType || "text";
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("input")[0];

                    inputEl.type = type;

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate("component_PleaseEnter") + $attr.rtLabel;
                        }
                    }

                    inputEl.style.textAlign = "right";//$ctrl.textAlign;
                }
            };
        }])
        /*-------   标签 + 输入   -------*/
        .directive('rtFormRow2Input', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtTips: "@",
                    rtPlaceholder: "@",
                    rtType: "@",
                    rtFocusOn: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: '='
                },
                template: '<div class="rt-form-row-2 rt-form-row-input">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" class="_require">*</span><span class="_tips">{{rtTips}}</span></label>' +
                    '    <input class="_input-text" ng-disabled="rtDisabled" ng-model="rtModel" focus-on="{{rtFocusOn}}" />' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var type = $attr.rtType || "text";
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("input")[0];

                    inputEl.type = type;

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate("component_PleaseEnter") + $attr.rtLabel;
                        }
                    }
                }
            };
        }])
        /*-------   标签 + 多行输入   -------*/
        .directive('rtFormRowTextarea', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                //require: '^rtForm',
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: '='
                },
                template: '<div class="rt-form-row rt-form-row-textarea">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" style="color: red;"> *</span></label>' +
                    '    <textarea class="_input-textarea" ng-disabled="rtDisabled" ng-model="rtModel" />' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("textarea")[0];

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate("component_PleaseEnter") + $attr.rtLabel;
                        }
                    }

                    inputEl.style.textAlign = "right";//$ctrl.textAlign;
                }
            };
        }])
        /*-------   标签 + 多行输入   -------*/
        .directive('rtFormRow2Textarea', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: '='
                },
                template: '<div class="rt-form-row-2 rt-form-row-textarea">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" class="_require">*</span><span class="_tips">{{rtTips}}</span></label>' +
                    '    <textarea class="_input-textarea" ng-disabled="rtDisabled" ng-model="rtModel" />' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("textarea")[0];

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate("component_PleaseEnter") + $attr.rtLabel;
                        }
                    }
                }
            };
        }])
        /*-------   标签 + 开关   -------*/
        .directive('rtFormRowToggle', function () {
            return {
                restrict: 'EA',
                //require: '^rtForm',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtModel: "=",
                    rtDisabled: "=",
                    rtRequired: "="
                },
                template: '<div class="rt-form-row rt-form-toggle">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" style="color: red;"> *</span></label>' +
                    '    <div class="_input-toggle">' +
                    '        <label class="toggle">' +
                    '           <input type="checkbox" ng-model="rtModel" ng-checked="rtModel" ng-disabled="rtDisabled">' +
                    '           <div class="track"><div class="handle"></div></div>' +
                    '       </label>' +
                    '    </div>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var inputEl = $element.find("label")[1];
                    inputEl.style.float = "right";//$ctrl.textAlign;
                }
            };
        })
        /*-------   标签 + 日期   -------*/
        .directive('rtFormRowDate', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                //require: '^rtForm',
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtDatepickerMode: "@",
                    rtType: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: "="
                },
                template: '<div class="rt-form-row rt-form-row-date">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" style="color: red;"> *</span></label>' +
                    '    <div class="_input-date">' +
                    '        <input type="{{rtType}}" ng-disabled="rtDisabled" ng-model="rtModel">' +
                    '        <i class="icon ion-ios-arrow-right"></i>' +
                    '    </div>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var type = $attr.rtType || "date";

                    var inputEl = $element.find("input")[0];
                    inputEl.style.textAlign = "right";//$ctrl.textAlign;

                    var datePicker = $attr.rtDatepickerMode;
                    if (type === "date" && datePicker === "calandar") {
                        inputEl.readOnly = true;
                        inputEl.parentElement.onclick = function () {
                            rt.showDatePickerDialog({
                                selectedValue: inputEl.value === "" ? null : new Date(inputEl.value),
                                scope: $scope,
                                success: function (result) {
                                    $scope.rtModel = rt.formatDateTime(result, "yyyy-MM-dd");
                                }
                            });
                        };
                    }
                }
            };
        })
        /*-------   标签 + 日期   -------*/
        .directive('rtFormRow2Date', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtType: "@",
                    rtDatepickerMode: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtModel: "="
                },
                template: '<div class="rt-form-row-2 rt-form-row-date">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" class="_require">*</span><span class="_tips">{{rtTips}}</span></label>' +
                    '    <div class="_input-date">' +
                    '        <input type="{{rtType}}" ng-disabled="rtDisabled" ng-model="rtModel">' +
                    '        <i class="icon ion-ios-arrow-down"></i>' +
                    '    </div>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var type = $attr.rtType || "date";

                    var inputEl = $element.find("input")[0];

                    var datePicker = $attr.rtDatepickerMode;
                    if (type === "date" && datePicker === "calandar") {
                        inputEl.readOnly = true;
                        inputEl.parentElement.onclick = function () {
                            rt.showDatePickerDialog({
                                selectedValue: inputEl.value === "" ? null : new Date(inputEl.value),
                                scope: $scope,
                                success: function (result) {
                                    $scope.rtModel = rt.formatDateTime(result, "yyyy-MM-dd");
                                }
                            });
                        };
                    }
                }
            };
        })
        /*-------   标签 + 下拉框   -------*/
        .directive('rtFormRowSelect', function () {
            return {
                restrict: 'E',
                replace: true,
                //require: '^rtForm',
                scope: false,
                template: function (element, attrs) {
                    return '<div class="rt-form-row rt-form-row-select">' +
                        '    <label class="_input-label">' + attrs.rtLabel + (attrs.rtRequired === "true" ? '<span style="color: red;"> *</span>' : '') + '</label>' +
                        '    <div class="_input-select">' +
                        '        <i class="icon ion-ios-arrow-right"></i>' +
                        '        <select ng-disabled="' + attrs.rtDisabled + '" ng-model="' + attrs.rtModel + '" ng-options="' + attrs.rtOptions + '">' +
                        '                <option value="" ng-if="false"></option>' +
                        '        </select>' +
                        '    </div>' +
                        '</div>';
                },
                link: function ($scope, $element, $attr, $ctrl) {
                    var inputEl = $element.find("select")[0];
                    inputEl.style.textAlign = "right";//$ctrl.textAlign;
                    inputEl.style.direction = "rtl";//$ctrl.textAlign === "right" ? "rtl" : "ltr";
                }
            };
        })
        .directive('rtFormRow2Select', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: false,
                template: function (element, attrs) {
                    return '<div class="rt-form-row-2 rt-form-row-select">' +
                        '    <label class="_input-label">' + attrs.rtLabel + (attrs.rtRequired === "true" ? '<span class="_require">*</span>' : '') + '<span class="_tips">{{rtTips}}</span></label>' +
                        '    <div class="_input-select">' +
                        '        <i class="icon ion-ios-arrow-down"></i>' +
                        '        <select ng-disabled="' + attrs.rtDisabled + '" ng-model="' + attrs.rtModel + '" ng-options="' + attrs.rtOptions + '">' +
                        '                <option value="" ng-if="false"></option>' +
                        '        </select>' +
                        '    </div>' +
                        '</div>';
                }
            };
        })
        /*-------   标签 + 查找   -------*/
        .directive('rtFormRowLookup', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                //require: '^rtForm',
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtTextModel: "=",
                    rtOnLookup: "&"
                },
                template: '<div class="rt-form-row rt-form-row-lookup">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" style="color: red;"> *</span></label>' +
                    '    <div class="_input-lookup" ng-click="openLookupView()">' +
                    '        <i class="icon ion-ios-arrow-right"></i>' +
                    '        <input type="text" readonly="readonly" ng-disabled="true" ng-model="rtTextModel" />' +
                    '    </div>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("input")[0];

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate('component_PleaseSelect') + $attr.rtLabel;
                        }
                    }

                    inputEl.style.textAlign = "right";//$ctrl.textAlign;
                },
                controller: function ($scope) {
                    $scope.openLookupView = function () {
                        var disabled = $scope.rtDisabled;
                        if (!disabled && $scope.rtOnLookup !== null && $scope.rtOnLookup !== undefined) {
                            $scope.rtOnLookup();
                        }
                    };
                }
            };
        }])
        /*-------   标签 + 查找   -------*/
        .directive('rtFormRow2Lookup', ['rt', function (rt) {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtLabel: "@",
                    rtPlaceholder: "@",
                    rtRequired: "=",
                    rtDisabled: "=",
                    rtTextModel: "=",
                    rtOnLookup: "&"
                },
                template: '<div class="rt-form-row-2 rt-form-row-lookup">' +
                    '    <label class="_input-label">{{rtLabel}}<span ng-if="rtRequired" class="_require">*</span><span class="_tips">{{rtTips}}</span></label>' +
                    '    <div class="_input-lookup" ng-click="openLookupView()">' +
                    '        <i class="icon ion-ios-search"></i>' +
                    '        <input type="text" readonly="readonly" ng-disabled="true" ng-model="rtTextModel" />' +
                    '    </div>' +
                    '</div>',
                link: function ($scope, $element, $attr, $ctrl) {
                    var placeholder = $attr.rtPlaceholder;
                    var disabled = rt.isNull($attr.rtDisabled) ? false : $attr.rtDisabled.toLocaleLowerCase() === "true";

                    var inputEl = $element.find("input")[0];

                    if (!disabled) {
                        if (placeholder !== null && placeholder !== undefined) {
                            inputEl.placeholder = placeholder;
                        } else {
                            inputEl.placeholder = rt.translate('component_PleaseSelect') + $attr.rtLabel;
                        }
                    }
                },
                controller: function ($scope) {
                    $scope.openLookupView = function () {
                        var disabled = $scope.rtDisabled;
                        if (!disabled && $scope.rtOnLookup !== null && $scope.rtOnLookup !== undefined) {
                            $scope.rtOnLookup();
                        }
                    };
                }
            };
        }]);
})(window, document);

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2017-03-15
 说明    : 友好日期时间字符串格式化
 *********************************************************/
/*global angular*/
angular.module('xrmApp')
    .filter('FriendlyDateString', ['rt', function (rt) {
      'use strict';

        return function (date, isShowTime) {
            return rt.formatDateTime2(date, isShowTime);
        };
    }]);

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   :
 创建时间 : 2016-03-10
 说明     : 列表
 *********************************************************/
/*global angular*/

angular.module('xrmApp')
    /*-------   列表   -------*/
    .directive('rtList', function($timeout) {
        'use strict';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                hasDivider: "@"
            },
            compile: function($element, $attr) {
                $element.addClass("rt-list");

                if ($attr.hasDivider === "true") {
                    var items = $element.children();
                    for (var i = 0; i < items.length - 1; i++) {
                        items.eq(i).after('<div class="rt-divider"></div>');
                    }
                }
            }
        };
    })
    /*-------   列表项   -------*/
    .directive('rtItem', function() {
        'use strict';
        return {
            restrict: 'E',
            compile: function($element, $attr) {
                $element.addClass("rt-item").append($element.contents());
            }
        };
    });

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : East Lv
 创建时间 : 2016-06-03
 说明     : 导航相关控件
 *********************************************************/
/*global angular*/

(function() {
    'use strict';

    angular.module('xrmApp')
        /*-------   列表   -------*/
        .directive('rtNavButtonBack', function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtOnClick: "&"
                },
                template: '<button class="button button-clear button-icon back-button ion-ios-arrow-left" ng-click="rtOnClick()"></button>'
            };
        })
        .directive("rtNavButtonAdd", function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtOnClick: "&"
                },
                template: '<button class="button button-clear button-icon ion-ios-plus-empty" ng-click="rtOnClick()"></button>'
            };
        })
        .directive("rtNavButtonMore", function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtOnClick: "&"
                },
                template: '<button class="button button-clear button-icon ion-ios-more" ng-click="rtOnClick()"></button>'
            };
        })
        .directive("rtNavButtonFilter", function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rtOnClick: "&"
                },
                template: '<button class="button button-clear button-icon rt-icon-filter" ng-click="rtOnClick()"></button>'
            };
        })
        .directive("rtNavButtonText", function() {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                template: '<button class="button button-clear" ng-click="rtOnClick()" ng-transclude></button>',
                scope: {
                    rtOnClick: "&"
                }
            };
        });
})();

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : Channing Guo
 创建时间 : 2016-05-03
 说明     : 搜索栏组件
 *********************************************************/
/*global angular*/
angular.module('xrmApp')
   .directive('rtSearchBar', ['$timeout', 'rt', function ($timeout, rt) {
     'use strict';
     return {
         restrict: "EA",
         scope: {
             rtSearchBar: "@",
             rtPlaceholder: "@",
             rtModel: "=", // 引用传递（双向绑定）
             rtOnSearch: "&" // 搜索操作
         },
         template: '<div class="rt-search-bar">' +
         '	<div class="_input-wrapper">' +
         '		<i class="ion-ios-search"></i>' +
         '		<input ng-model="rtModel" type="text" placeholder="{{rtPlaceholder}}" />' +
         '	</div>' +
         '	<button class="button button-clear button-small _button-search" ng-click="rtOnSearch()">{{ "component_Search" | translate }}</button>' +
         '</div>',
         replace: true
     };
   }])
   .directive('rtSearchBar2', ['$timeout', 'rt', function ($timeout, rt) {
     'use strict';
     return {
         restrict: "EA",
         scope: {
             rtPlaceholder: "@",
             rtOnFocus: "&" // 搜索操作
         },
         template: '<div class="rt-search-bar">' +
         '	<div class="_input-wrapper">' +
         '		<i class="ion-ios-search" style="z-index: 20;"></i>' +
         '		<input type="text" placeholder="{{rtPlaceholder}}" style="position: relative;display: block;z-index: 10;" />' +
         '     <div style="background: transparent;height: 30px;width: 100%;z-index: 30;display: block;top: 0px;position: absolute;" ng-click="rtOnFocus()"></div>' +
         '	</div>' +
         '</div>',
         replace: true
     };
   }]);

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : Channing Guo
 创建时间 : 2016-05-12
 说明     : Section(节)组件
 *********************************************************/
angular.module('xrmApp')
    .directive('rtSection', function() {
        "use strict";
        return {
            restrict: "EA",
            scope: false,
            replace: true,
            template: function(element, attrs) {
                return '<div class="rt-section">' +
                    '<i' + (angular.isDefined(attrs.rtColor) ? ' style="background-color:'+attrs.rtColor+'"' : "") + '></i>' +
                    attrs.rtTitle +
                    '</div>';
            }
        };
    });
/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : Channing Guo
 创建时间 : 2016-05-12
 说明     : Tags组件
 *********************************************************/
/*global angular*/
angular.module('xrmApp')
    .directive('rtTags', function() {
        "use strict";
        return {
            restrict: "EA",
            scope: {
                rtDataSource: "=", // 显示的数据源 + 用于获取选中情况
                rtColumns: "@", // 每行显示的个数
                rtType: "@", // 选择类型：单选、多选
                rtModel: "=" // 选择的情况
            },
            template: '<div style="width: 100%;padding-left: 10px;padding-right: 10px;background-color: white;">' +
                '<div ng-repeat="data in rtData" style="width: {{columnWidth}}%;padding: 6px;display: inline-block;"><a class="button button-small" ng-class="' +
                '{\'rt-tags\': data.state == 0, \'rt-tags-selected\': data.state == 1}' +
                '" ng-click="selectTag(tag)">{{data.name}}</a></div>' +
                '</div>',
            replace: true,
            transclude: false,
            controller: ["$scope", function($scope) {

                function indexOf(arr, id) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].id === id) {
                            return i;
                        }
                    }
                    return -1;
                }

                // 列数
                var columnNumbers = angular.isDefined($scope.rtColumns) ? $scope.rtColumns : 3;
                if (columnNumbers <= 0) {
                    columnNumbers = 3;
                }

                // 计算每列的宽度
                $scope.columnWidth = (100 / columnNumbers).toFixed(8);

                // 类型，单选还是多选
                var TYPE_SINGLE = "single";
                var TYPE_MULTI = "multi";
                var type = angular.isDefined($scope.rtType) ? $scope.rtType : TYPE_SINGLE;
                if (type.length === 0) {
                    type = TYPE_SINGLE;
                }

                var dataSource = $scope.rtDataSource;

                $scope.selectTag = function(tag) {
                    // 这里区分单选、多选
                    if (type === TYPE_SINGLE) {
                        if (tag.state === 1) {
                            tag.state = 0;
                            $scope.rtModel = {};
                        } else {
                            for (var j = 0; j < dataSource.length; j++) {
                                if (dataSource[j].id === tag.id) {
                                    dataSource[j].state = 1;
                                    $scope.rtModel = {
                                        id: tag.id,
                                        name: tag.name,
                                        state: tag.state
                                    };
                                    continue;
                                }
                                dataSource.state = 0;
                            }
                        }
                    } else if (type === TYPE_MULTI) {
                        for (var i = 0; i < dataSource.length; i++) {
                            if (dataSource[i].state === 0 && dataSource[i].id === tag.id) {
                                dataSource[i].state = 1;
                                $scope.rtModel.push({
                                    id: tag.id,
                                    name: tag.name,
                                    state: tag.state
                                });
                                break;
                            }
                            if (dataSource[i].state === 1 && dataSource[i].id === tag.id) {
                                dataSource[i].state = 0;
                                var index = indexOf($scope.rtModel, tag.id);
                                $scope.rtModel.splice(index, 1);
                                break;
                            }
                        }
                    }
                };
            }]
        };
    });

/********************************************************
 Copyright @ 苏州瑞泰信息技术有限公司 All rights reserved.
 创建人   : east lv
 创建时间 : 2016-05-18
 说明     : 缩略图
 *********************************************************/
/*global angular:false */

(function (window, document, undefined) {
    'use strict';

    angular.module('xrmApp')
        .directive('rtThumbnails', ['rt', function (rt) {
            var isWechat = rt.isWeixinBrowser();
            if (isWechat) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: false,
                    template: function (element, attrs) {
                        return '<div class="rt-thumbnails">' +
                            '    <div class="rt-thumbnail" ng-repeat="image in ' + attrs.rtModel + '">' +
                            '        <img ng-src="{{image.' + attrs.rtUrlProperty + '}}" ng-click="previewImage($index);" />' +
                            '    </div>' +
                            '    <div class="rt-choose-image" ng-if="' + (angular.isDefined(attrs.rtCanAdd) ? attrs.rtCanAdd : "true") + '">' +
                            '        <img ng-src="data:image/png;base64,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" ng-click="chooseImage();"/>' +
                            '    </div>' +
                            '</div>';
                    },
                    link: function (scope, element, attrs, ngModelCtrl) {
                        scope.previewImage = function (index) {
                            var photoList = eval("scope." + attrs.rtModel);

                            var urls = [];
                            for (var i = 0; i < photoList.length; i++) {
                                var url = photoList[i][attrs.rtUrlProperty];
                                if (!url.startWith("http")) {
                                    url = rt.getBaseApiUrl() + url;
                                }
                                urls.push(url);
                            }
                            rt.previewImage({
                                current: urls[index],
                                urls: urls
                            });
                        };

                        scope.onImageDeleted = function (index) {
                            var photoList = eval("scope." + attrs.rtModel);
                            if (index < 0 || index >= photoList.length) {
                                return;
                            }

                            photoList.splice(index, 1);
                        };

                        scope.chooseImage = function () {
                            rt.chooseImage({
                                sourceType: [attrs.rtSourceType]
                            }).then(function (res) {
                                var photoList = eval("scope." + attrs.rtModel);
                                for (var i = 0; i < res.localIds.length; i++) {
                                    var o = {};
                                    o[attrs.rtKeyProperty] = "";
                                    o[attrs.rtValueProperty] = "";
                                    o["LocalId"] = res.localIds[i];
                                    o[attrs.rtUrlProperty] = res.localIds[i];
                                    photoList.push(o);
                                }
                            });
                        };
                    }
                }
            } else {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: false,
                    template: function (element, attrs) {
                        return '<div class="rt-thumbnails">' +
                            '    <div class="rt-thumbnail" ng-repeat="image in ' + attrs.rtModel + '">' +
                            '        <img ng-src="data:image/jpeg;base64,{{image.' + attrs.rtValueProperty + '}}" ng-click="previewImage($index);" />' +
                            '    </div>' +
                            '    <div class="rt-choose-image" ng-if="' + (angular.isDefined(attrs.rtCanAdd) ? attrs.rtCanAdd : "true") + '">' +
                            '        <img ng-src="data:image/png;base64,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" ng-click="chooseImage();"/>' +
                            '    </div>' +
                            '</div>';
                    },
                    link: function (scope, element, attrs, ngModelCtrl) {
                        scope.previewImage = function (index) {
                            var photoList = eval("scope." + attrs.rtModel);
                            var previewImageList = [];
                            for (var i = 0; i < photoList.length; i++) {
                                previewImageList.push({
                                    "Id": photoList[i][attrs.rtKeyProperty],
                                    "Base64Content": photoList[i][attrs.rtValueProperty]
                                });
                            }
                            scope.previewImageList = previewImageList;
                            scope.myActiveSlide = index;
                            //scope.canDelete = angular.isDefined(attrs.rtCanDelete) ? eval("scope." + attrs.rtCanDelete) === true : true;

                            rt.showDialog('component/imagePreviewerView.html', scope, null);
                        };

                        scope.onImageDeleted = function (index) {
                            var photoList = eval("scope." + attrs.rtModel);
                            if (index < 0 || index >= photoList.length) {
                                return;
                            }

                            photoList.splice(index, 1);
                        };

                        scope.chooseImage = function () {
                            rt.chooseImage({
                                sourceType: [attrs.rtSourceType]
                            }).then(function (base64Image) {
                                var photoList = eval("scope." + attrs.rtModel);

                                var o = {};
                                o[attrs.rtKeyProperty] = "";
                                o[attrs.rtValueProperty] = base64Image;
                                photoList.push(o);
                            }, function (error) {
                                rt.alert(error);
                            });
                        };
                    }
                }
            }
        }]);
})(window, document);

/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global wx:false */
(function () {
    'use strict';
    angular.module('xrmApp')
        .service('rtAppSdk', ['$http', '$q', 'rtRestClient', 'rtUtils', '$ionicHistory', '$ionicActionSheet', '$state', '$timeout', function ($http, $q, rtRestClient, rtUtils, $ionicHistory, $ionicActionSheet, $state, $timeout) {
            var isApp = !rtUtils.isWeixinBrowser();
            if (!isApp) {
                return;
            }

            this.getLocation = _getLocation;
            this.openLocation = _openLocation;
            this.chooseImage = _chooseImage;
            this.previewImage = _previewImage;
            this.uploadImage = _uploadImage;
            this.downloadImage = _downloadImage;
            this.getNetworkType = _getNetworkType;
            this.scanQRCode = _scanQRCode;
            this.scanVCard = _scanVCard;
            this.closeWindow = _closeWindow;
            this.openWindow = _openWindow;
            this.logout = _logout;
            this.exit = _exit;
            this.openEmail = _openEmail;
            this.getDeviceType = _getDeviceType;
            this.getAppId = _getAppId;
            this.getAppName = _getAppName;

            /**
             * 微信定位方法
             * @param success
             * @param error
             */
            function _getLocation() {
                var deferred = $q.defer();

                function _getLocationIOS() {
                    if (window.XrmDeviceGeoIOS && window.XrmDeviceGeoIOS.getGeoLocationData) {
                        var position = window.XrmDeviceGeoIOS.getGeoLocationData();
                        if (position !== null && position != "") {
                            window.XrmDeviceGeoIOS.clearGeoLocationData();

                            var l = position;

                            // 创建地理编码实例
                            var myGeo = new BMap.Geocoder();
                            // 根据坐标得到地址描述
                            myGeo.getLocation(new BMap.Point(l.longitude, l.latitude), function (result) {
                                if (result) {
                                    l.address = result.address;
                                    l.surroundingPois = result.surroundingPois;
                                }
                                deferred.resolve(l);
                            }, { poiRadius: 500, numPois: 10 });

                            return;
                        }
                    }
                    $timeout(_getLocationIOS, 1000);
                }

                function _getLocationAndroid() {
                    var position = window.XrmDeviceGeo.getGeoLoaction();
                    if (position === null) {
                        deferred.reject();
                        return;
                    }

                    var l = JSON.parse(position);

                    // 创建地理编码实例
                    var myGeo = new BMap.Geocoder();
                    // 根据坐标得到地址描述
                    myGeo.getLocation(new BMap.Point(l.longitude, l.latitude), function (result) {
                        if (result) {
                            l.address = result.address;
                            l.surroundingPois = result.surroundingPois;
                        }
                        deferred.resolve(l);
                    });
                }

                if (window.XrmDeviceGeo && window.XrmDeviceGeo.getGeoLoaction) {
                    _getLocationAndroid();
                } else if (window.localStorage.getItem('XrmDeviceGeoIOS')) {
                    location.href = "app:get-location";
                    _getLocationIOS();
                }

                return deferred.promise;
            }

            function _openLocation(config) {
                //
            }

            function _chooseAlbum(px, kb) {
                var deferred = $q.defer();

                location.href = "app:choose-photo?px=" + px + "&kb=" + kb;

                function getImageResult() {
                    if (!rtUtils.isNull(window.XrmImageData) && !rtUtils.isNull(window.XrmImageData.getXrmImageData)) {
                        var image = window.XrmImageData.getXrmImageData();
                        if (!rtUtils.isNullOrEmptyString(image)) {
                            deferred.resolve(image);

                            window.XrmImageData.clearImageData();

                            return;
                        }
                    }
                    $timeout(getImageResult, 1500);
                }

                getImageResult();

                return deferred.promise;
            };

            function _takePhoto(px, kb) {
                var deferred = $q.defer();

                location.href = "app:take-photo?px=" + px + "&kb=" + kb;

                function getImageResult() {
                    if (!rtUtils.isNull(window.XrmImageData) && !rtUtils.isNull(window.XrmImageData.getXrmImageData)) {
                        var image = window.XrmImageData.getXrmImageData();
                        if (!rtUtils.isNullOrEmptyString(image)) {
                            deferred.resolve(image);

                            window.XrmImageData.clearImageData();

                            return;
                        }
                    }
                    $timeout(getImageResult, 1500);
                }

                getImageResult();

                return deferred.promise;
            };

            function _chooseImage(config) {
                if (config === null || config === undefined) {
                    return;
                }

                //处理图片的大小
                if ((config.px === null || config.px === undefined) &&
                    (config.kb === null || config.kb === undefined)) {
                    config.px = 800;
                    config.kb = 100;
                }

                var ALBUM = "album";
                var CAMERA = "camera";

                var px = config.px;
                var kb = config.kb;
                //处理图片的来源
                var sourceType = [];
                if (config.sourceType === null || config.sourceType === undefined) {
                    sourceType = [ALBUM, CAMERA];
                } else if (!(config.sourceType instanceof Array)) {
                    throw new Error("sourceType必须为数组!");
                } else {
                    for (var i = 0; i <= config.sourceType.length; i++) {
                        if (config.sourceType[i] === ALBUM || config.sourceType[i] === CAMERA) {
                            sourceType.push(config.sourceType[i]);
                        }
                    }
                }

                var self = this;

                //获取图片
                if (sourceType.length === 1) {
                    if (sourceType[0] === ALBUM) {
                        return _chooseAlbum(px, kb);
                    } else if (sourceType[0] === CAMERA) {
                        return _takePhoto(px, kb);
                    }
                } else {
                    var deferred = $q.defer();

                    var selectedButtons = [
                        { text: this.translate('component_ChooseImage_TakePhoto') },
                        { text: this.translate('component_ChooseImage_Album') }
                    ];

                    $ionicActionSheet.show({
                        buttons: selectedButtons,
                        titleText: this.translate('component_ChooseImage_Title'),
                        cancelText: this.translate('component_Cancel'),
                        cancel: function () {
                        },
                        buttonClicked: function (index) {
                            if (index === 0) {
                                _takePhoto(px, kb).then(function (image) {
                                    deferred.resolve(image);
                                });
                            } else if (index === 1) {
                                _chooseAlbum(px, kb).then(function (image) {
                                    deferred.resolve(image);
                                });
                            }
                            return true;
                        }
                    });

                    return deferred.promise;
                }
            }

            /**
             * 预览照片
             * @param config
             */
            function _previewImage(config) {
                alert("previewImage");
            }

            /**
             * 上传单张照片
             * @param config
             */
            function _uploadImage(config) {
                var deferred = $q.defer();

                alert("previewImage");

                return deferred.promise;
            }

            /**
             * 下载图片
             * @param config
             */
            function _downloadImage(config) {
                var deferred = $q.defer();

                alert("previewImage");

                return deferred.promise;
            }

            /**
             * 获取网络状态
             * @param config
             */
            function _getNetworkType() {
                var deferred = $q.defer();

                $timeout(function () {
                    deferred.resolve({
                        networkType: "wifi"
                    });
                }, 1000);

                return deferred.promise;
            }

            /**
             * 扫描二维码
             */
            function _scanQRCode(config) {
                var deferred = $q.defer();

                location.href = "app:scan";

                function getScanResult() {
                    var result = "";

                    if (window.XrmScanData && window.XrmScanData.getResult() !== "") {
                        result = window.XrmScanData.getResult();
                    }

                    if (!rtUtils.isNullOrEmptyString(result)) {
                        $timeout.cancel();

                        deferred.resolve(result);

                        window.XrmScanData.clearResult();
                        result = "";
                    }
                    else {
                        $timeout(getScanResult, 1000);
                    }
                }

                getScanResult();

                return deferred.promise;
            }

            function _scanVCard(config) {
                var deferred = $q.defer();

                location.href = "app:scan-vcard";

                function getScanResult() {
                    var result = "";

                    if (window.XrmOcrData && window.XrmOcrData.getVCard() !== "") {
                        result = window.XrmOcrData.getVCard();
                    }

                    if (!rtUtils.isNullOrEmptyString(result)) {
                        $timeout.cancel();

                        var vcard = JSON.parse(result);
                        deferred.resolve(vcard);

                        window.XrmOcrData.clearResult();
                        result = "";
                    }
                    else {
                        $timeout(getScanResult, 1000);
                    }
                }

                getScanResult();

                return deferred.promise;
            }

            /**
             * 关闭页面
             */
            function _closeWindow() {
                $state.go("app-close");
            }

            /**
             * 打开页面
             */
            function _openWindow(url, params) {
                if (rtUtils.isNullOrEmptyString(url)) {
                    throw new Error("Url can not be null or empty.");
                }

                if (rtUtils.isNull(params)) {
                    params = {};
                }

                if (rtUtils.isNull(params.navbar)) {
                    //默认不显示导航栏
                    params.navbar = false;
                }
                if (rtUtils.isNull(params.landscape)) {
                    params.landscape = false;
                }

                //是否需要包含导航栏
                if (params.navbar) {
                    url = "app:openheader@" + url;
                } else {
                    url = "app:opennew@" + url;
                }

                //是否横屏
                if (params.landscape) {
                    url += "?orientation=landscape";
                }

                location.href = url;
            }

            /**
             * 注销账号
             */
            function _logout() {
                location.href = "app:logout";
            }

            /**
             * 退出程序
             */
            function _exit() {
                location.href = "app:exit";
            }

            /**
             * 打开邮箱
             */
            function _openEmail() {
                //
            }

            /**
             * 获取设备类型
             */
            function _getDeviceType(config) {
                var deviceType;

                if (window.XrmDeviceData && window.XrmDeviceData.getDeviceType) {
                    deviceType = window.XrmDeviceData.getDeviceType();

                    if (typeof deviceType === 'string') {
                        deviceType = JSON.parse(deviceType);
                    }
                } else if (!rtUtils.isNullOrEmptyString(localStorage.DeviceType)) {
                    deviceType = JSON.parse(localStorage.DeviceType);
                } else {
                    rtUtils.showErrorToast("设备类型获取失败!");
                    return;
                }

                return deviceType;
            }

            function _getAppId() {
                //
            }

            function _getAppName() {
                //
            }
        }]);
})();
/*global angular:false */
/*global _:false */
/*global xrmApp:false */
/*global wx:false */
(function () {
    'use strict';
    angular.module('xrmApp')
        .service('rtWxSdk', ['$http', '$q', 'rtRestClient', 'rtUtils', '$ionicHistory', function ($http, $q, rtRestClient, rtUtils, $ionicHistory) {
            var isWechat = rtUtils.isWeixinBrowser();
            if (!isWechat) {
                return;
            }

            this.getLocation = _getLocation;
            this.openLocation = _openLocation;
            this.chooseImage = _chooseImage;
            this.previewImage = _previewImage;
            this.uploadImage = _uploadImage;
            this.downloadImage = _downloadImage;
            this.getNetworkType = _getNetworkType;
            this.scanQRCode = _scanQRCode;
            this.closeWindow = _closeWindow;
            this.openWindow = _openWindow;
            this.logout = _logout;
            this.exit = _exit;
            this.openEmail = _openEmail;
            this.getDeviceType = _getDeviceType;
            this.getAppId = _getAppId;
            this.getAppName = _getAppName;

            /**
             * 微信定位方法
             * @param success
             * @param error
             */
            function _getLocation() {
                var deferred = $q.defer();
                wx.ready(function () {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，
                        // 如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            var speed = res.speed; // 速度，以米/每秒计
                            var accuracy = res.accuracy; // 位置精度

                            var result = {
                                latitude_wgs84: latitude,
                                longitude_wgs84: longitude
                            };
                            //调用百度的API将GPS坐标转换成百度的火星坐标
                            rtUtils.convertGps2BaiduCoordinates(longitude, latitude)
                                .then(function (res) {
                                    var d = res.data;

                                    if (d === undefined || d === null || d.status !== 0 || d.result === null || d.result.length === 0) {
                                        throw new Error("调用百度坐标转换的API错误,错误码：" + d.status);
                                    }
                                    result.longitude = result.longitude_bd09 = d.result[0].x;
                                    result.latitude = result.latitude_bd09 = d.result[0].y;

                                    //将地址转成火星坐标
                                    return rtUtils.convertGps2MarsCoordinates(longitude, latitude);
                                })
                                .then(function (res) {
                                    var d = res.data;

                                    if (d.status === "0") {
                                        throw new Error("调用火星坐标转换的API错误,错误描述：" + d.info);
                                    }
                                    var location = d.locations.split(',');
                                    var longitude = parseFloat(location[0]);
                                    var latitude = parseFloat(location[1]);

                                    result.longitude_gcj02 = longitude;
                                    result.latitude_gcj02 = latitude;

                                    //获取经纬度对应的详细地址
                                    return rtUtils.inverseGeocoding(longitude, latitude);
                                })
                                .then(function (res) {
                                    var d = res.data;

                                    if (d.status === "0") {
                                        throw new Error(d.info);
                                    }

                                    result.province = d.regeocode.province;
                                    result.city = d.regeocode.city;
                                    result.district = d.regeocode.district;
                                    result.town = d.regeocode.township;
                                    result.street = d.regeocode.street;
                                    result.streetNumber = d.regeocode.streetNumber;

                                    result.address = d.regeocode.formatted_address;

                                    deferred.resolve(result);
                                })
                                .catch(function (errorMessage) {
                                    deferred.reject(errorMessage);
                                });
                            // .success(function (d) {
                            //     if (d === undefined || d === null || d.status !== 0 || d.result === null || d.result.length === 0) {
                            //         deferred.reject("调用百度火星坐标转换的API错误,错误码：" + d.status);
                            //         return;
                            //     }
                            //     var newLongitude = d.result[0].x;
                            //     var newLatitude = d.result[0].y;
                            //     // 创建地理编码实例
                            //     var myGeo = new BMap.Geocoder();
                            //     // 根据坐标得到地址描述
                            //     myGeo.getLocation(new BMap.Point(newLongitude, newLatitude), function (result) {
                            //         deferred.resolve({
                            //             latitude: result.point.lat,
                            //             longitude: result.point.lng,
                            //             address: result.address
                            //         });
                            //     });
                            // })
                            // .error(function (errorMessage) {
                            //     deferred.reject(errorMessage);
                            // });

                        },
                        fail: function (error) {
                            deferred.reject(error.errorMsg);
                        }
                    });
                });

                return deferred.promise;
            }

            function _openLocation(config) {
                wx.openLocation(config);
            }

            function _chooseImage(config) {
                config = config || {};

                var deferred = $q.defer();

                wx.chooseImage({
                    count: config.count, // 默认9
                    sizeType: config.sizeType, // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: config.sourceType, // 可以指定来源是相册还是相机，默认二者都有
                    success: function (res) {
                        deferred.resolve(res); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    },
                    fail: function (error) {
                        deferred.reject(error.errMsg);
                    }
                });

                return deferred.promise;
            }

            /**
             * 预览照片
             * @param config
             */
            function _previewImage(config) {
                wx.previewImage(config);
            }

            /**
             * 上传单张照片
             * @param config
             */
            function _uploadImage(config) {
                config = config || {};

                var deferred = $q.defer();

                wx.uploadImage({
                    localId: config.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: config.isShowProgressTips, // 默认为1，显示进度提示
                    success: function (res) {
                        deferred.resolve(res); // 返回图片的服务器端ID
                    },
                    error: function (error) {
                        deferred.reject(error.errMsg);
                    }
                });

                return deferred.promise;
            }

            /**
             * 下载图片
             * @param config
             */
            function _downloadImage(config) {
                config = config || {};

                var deferred = $q.defer();

                wx.downloadImage({
                    serverId: config.serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
                    isShowProgressTips: config.isShowProgressTips, // 默认为1，显示进度提示
                    success: function (res) {
                        deferred.resolve(res); // 返回图片下载后的本地ID
                    }
                });

                return deferred.promise;
            }

            /**
             * 获取网络状态
             * @param config
             */
            function _getNetworkType() {
                var deferred = $q.defer();

                wx.getNetworkType({
                    success: function (res) {
                        deferred.resolve(res);
                    }
                });

                return deferred.promise;
            }

            /**
             * 扫描二维码
             */
            function _scanQRCode(config) {
                config = config || {};

                var deferred = $q.defer();

                if (rtUtils.isNull(config)) {
                    config = {};
                }

                if (rtUtils.isNull(config.desc)) {
                    config.desc = "";
                }

                if (rtUtils.isNull(config.scanType)) {
                    config.scanType = ["qrCode", "barCode"];
                }

                wx.scanQRCode({
                    desc: config.desc,
                    needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: config.scanType, // 可以指定扫二维码还是一维码，默认二者都有
                    success: function (res) {
                        var resultStr = res.resultStr;
                        var resultList = resultStr.split(",");
                        if (resultList.length > 1) {
                            resultStr = resultList[1];
                        }
                        deferred.resolve(resultStr);
                    },
                    error: function (res) {
                        if (res.errMsg.indexOf('function_not_exist') > 0) {
                            deferred.reject('版本过低请升级');
                        } else {
                            deferred.reject(res.errMsg);
                        }
                    }
                });

                return deferred.promise;
            }

            /**
             * 关闭页面
             */
            function _closeWindow() {
                wx.closeWindow();
            }

            /**
             * 打开页面
             */
            function _openWindow(url, params) {
                //
            }

            /**
             * 注销账号
             */
            function _logout() {
                //
            }

            /**
             * 退出程序
             */
            function _exit() {
                //
            }

            /**
             * 打开邮箱
             */
            function _openEmail() {
                //
            }

            /**
             * 获取设备类型
             */
            function _getDeviceType(config) {
                //
            }

            function _getAppName() {
                var appName = rtUtils.getUrlParamFromHash("appName") || localStorage.Wechat_AppName || "";
                localStorage.Wechat_AppName = appName;
                return appName;
            }

            function _getAppId() {
                return localStorage["Wechat_" + _getAppName() + "_AppId"];
            }

            function _setAppId(appId) {
                localStorage["Wechat_" + _getAppName() + "_AppId"] = appId;
            }

            /**
             * 通过config接口注入权限验证配置
             */
            function _config() {
                var appId = _getAppId();

                var promises = [];
                promises.push(rtRestClient.get("api/WeChatQy/GetJsApiTicket"));
                //如果appId还没获取过，则从服务器端获取
                if (rtUtils.isNullOrEmptyString(appId)) {
                    promises.push(rtRestClient.get("api/WeChatQy/GetAppId"));
                }

                $q.all(promises)
                    .then(function (responses) {
                        var ticket = responses[0].data;
                        if (rtUtils.isNullOrEmptyString(appId)) {
                            appId = responses[1].data;

                            _setAppId(appId);
                        }

                        var timestamp = Date.parse(new Date());
                        var locationUrl = window.location.href.split('#')[0];
                        var sign = 'jsapi_ticket=' + ticket + '&noncestr=HcGwOqUaLR2oCR6P&timestamp=' +
                            timestamp + '&url=' + locationUrl;
                        var signature = hex_sha1(sign);

                        wx.config({
                            debug: false,
                            appId: appId,
                            timestamp: timestamp,
                            nonceStr: 'HcGwOqUaLR2oCR6P',
                            signature: signature,
                            jsApiList: [
                                'checkJsApi',
                                'onMenuShareTimeline',
                                'onMenuShareAppMessage',
                                'onMenuShareQQ',
                                'onMenuShareWeibo',
                                'onMenuShareQZone',
                                'hideMenuItems',
                                'showMenuItems',
                                'hideAllNonBaseMenuItem',
                                'showAllNonBaseMenuItem',
                                'translateVoice',
                                'startRecord',
                                'stopRecord',
                                'onVoiceRecordEnd',
                                'playVoice',
                                'onVoicePlayEnd',
                                'pauseVoice',
                                'stopVoice',
                                'uploadVoice',
                                'downloadVoice',
                                'chooseImage',
                                'getLocalImgData',
                                'previewImage',
                                'uploadImage',
                                'downloadImage',
                                'getNetworkType',
                                'openLocation',
                                'getLocation',
                                'hideOptionMenu',
                                'showOptionMenu',
                                'closeWindow',
                                'scanQRCode',
                                'chooseWXPay',
                                'openProductSpecificView',
                                'addCard',
                                'chooseCard',
                                'openCard'
                            ],
                            fail: function (errMsg) {
                                alert(errMsg);
                            }
                        });
                    });
            }

            var hexcase = 0;
            /* hex output format. 0 - lowercase; 1 - uppercase        */
            var chrsz = 8;
            /* bits per input character. 8 - ASCII; 16 - Unicode      */

            function hex_sha1(s) {
                return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
            }

            /*
             * Calculate the SHA-1 of an array of big-endian words, and a bit length
             */
            function core_sha1(x, len) {
                /* append padding */
                x[len >> 5] |= 0x80 << (24 - len % 32);
                x[((len + 64 >> 9) << 4) + 15] = len;

                var w = new Array(80);
                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;
                var e = -1009589776;

                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;
                    var olde = e;

                    for (var j = 0; j < 80; j++) {
                        if (j < 16) w[j] = x[i + j];
                        else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                        var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                            safe_add(safe_add(e, w[j]), sha1_kt(j)));
                        e = d;
                        d = c;
                        c = rol(b, 30);
                        b = a;
                        a = t;
                    }

                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                    e = safe_add(e, olde);
                }
                return [a, b, c, d, e];

            }

            /*
             * Perform the appropriate triplet combination function for the current
             * iteration
             */
            function sha1_ft(t, b, c, d) {
                if (t < 20) return (b & c) | ((~b) & d);
                if (t < 40) return b ^ c ^ d;
                if (t < 60) return (b & c) | (b & d) | (c & d);
                return b ^ c ^ d;
            }

            /*
             * Determine the appropriate additive constant for the current iteration
             */
            function sha1_kt(t) {
                return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
                    (t < 60) ? -1894007588 : -899497514;
            }

            /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally
             * to work around bugs in some JS interpreters.
             */
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }

            /*
             * Bitwise rotate a 32-bit number to the left.
             */
            function rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }

            /*
             * Convert an 8-bit or 16-bit string to an array of big-endian words
             * In 8-bit function, characters >255 have their hi-byte silently ignored.
             */
            function str2binb(str) {
                var bin = [];
                var mask = (1 << chrsz) - 1;
                for (var i = 0; i < str.length * chrsz; i += chrsz)
                    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i % 32);
                return bin;
            }

            /*
             * Convert an array of big-endian words to a hex string.
             */
            function binb2hex(binarray) {
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var str = "";
                for (var i = 0; i < binarray.length * 4; i++) {
                    str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                        hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
                }
                return str;
            }

            _config();
        }]);
})();