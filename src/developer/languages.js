/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function () {
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en-US', {
            'LOGIN_CHOOSE_LANGUAGE': 'Choose Language',

            'LOGIN_REMEMBER_PASSWORD': 'Remember password',
            'LOGIN_SET_SERVER_URL': 'Set ServerUrl',

            'LOGIN_PLS_INPUT_USERNAME': 'Please input account name',
            'LOGIN_PLS_INPUT_PASSWORD': 'Please input password',

            'LOGIN': 'Login'
        });
    }]);
})();
/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function(){
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('ja-JP', {
            'LOGIN_CHOOSE_LANGUAGE': '請選擇語言',

            'LOGIN_REMEMBER_PASSWORD': '記住密碼',
            'LOGIN_SET_SERVER_URL': '設置服務器',

            'LOGIN_PLS_INPUT_USERNAME': '請輸入您的賬號',
            'LOGIN_PLS_INPUT_PASSWORD': '請輸入您的密碼',

            'LOGIN': 'Login'
        });
    }]);
})();
/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function(){
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('zh-CN', {
            'LOGIN_CHOOSE_LANGUAGE':'选择语言',

            'LOGIN_REMEMBER_PASSWORD': '记住密码',
            'LOGIN_SET_SERVER_URL': '设置服务器',

            'LOGIN_PLS_INPUT_USERNAME':'请输入账号',
            'LOGIN_PLS_INPUT_PASSWORD':'请输入密码',

            'LOGIN':'登录'
        });
    }]);
})();