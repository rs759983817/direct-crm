/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function () {
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en-US', {
            'component_OK': 'OK',
            'component_Cancel': 'Cancel',
            'component_Search': 'Search',
            'component_Delete':'Delete',
            'component_Reset':"Reset",
            'component_Confirm':'Confirm',
            
            'component_Loading': 'Loading...',

            'component_Image_Preview':'Preview',
            'component_ChooseImage_Title': 'Please choose the operation you need',
            'component_ChooseImage_TakePhoto': 'Take Photo',
            'component_ChooseImage_Album': 'Choose from Photos',

            'component_PleaseEnter':'Please Enter ',
            'component_PleaseSelect':'Please Select '
        });
    }]);
})();
/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function () {
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('ja-JP', {
            'component_OK': 'OK',
            'component_Cancel': 'キャンセル',
            'component_Search': '検索',
            'component_Delete':'削除',
            'component_Reset':"リセット",
            'component_Confirm':'確認',
            
            'component_Loading': 'ローディング',

            'component_Image_Preview':'写真プレビュー',
            'component_ChooseImage_Title': 'ご操作を選択してください',
            'component_ChooseImage_TakePhoto': '写真取り',
            'component_ChooseImage_Album': '携帯のアルバムから選択',

            'component_PleaseEnter':'入力してください',
            'component_PleaseSelect':'選んでください'
        });
    }]);
})();
/**
 * Created by lvdongbo on 2016/5/23.
 */
/*global xrmApp*/

(function () {
    "use strict";
    xrmApp.config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('zh-CN', {
            'component_OK': '确定',
            'component_Cancel': '取消',
            'component_Search': '搜索',
            'component_Delete': '删除',
            'component_Reset': "重置",
            'component_Confirm': '确认',
            
            'component_Loading': '正在加载...',

            'component_Image_Preview':'照片预览',
            'component_ChooseImage_Title': '选择您需要进行的操作',
            'component_ChooseImage_TakePhoto': '拍照',
            'component_ChooseImage_Album': '从手机相册选择',

            'component_PleaseEnter':'请输入',
            'component_PleaseSelect':'请选择'
        });
    }]);
})();