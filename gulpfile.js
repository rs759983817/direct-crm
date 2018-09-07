var gulp = require('gulp');
var del = require('del');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var minifyCss = require('gulp-minify-css');
var argv = require('minimist')(process.argv.slice(2));
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var htmlreplace = require('gulp-html-replace');
var sass = require('gulp-sass');

var conf = require('./gulpconf');

var version = gutil.date('yyyymmddHHMMss');

var IS_RELEASE_BUILD = !!argv.release;
if (IS_RELEASE_BUILD) {
    gutil.log(
        gutil.colors.white("Release Build:" + (new Date()))
    );
    gutil.log(
        gutil.colors.white("---------------------------------------------")
    );
} else {
    gutil.log(
        gutil.colors.white("Debug Build:" + (new Date()))
    );
    gutil.log(
        gutil.colors.white("---------------------------------------------")
    );
}

var IS_WECHAT = conf.build.isWechat;
var IS_APP = conf.build.isApp;

var dest_wechat = "build/debug/wechat";
var dest_app = "build/debug/app";
if (IS_RELEASE_BUILD) {
    dest_wechat = 'build/release/wechat';
    dest_app = "build/release/app";
}

//开发版本文件拷贝
gulp.task('cleanup', function () {
    del(['build']);
});

// 语法检查
gulp.task('jshint', function () {
    gulp.src('src/module/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//开发版本文件拷贝
gulp.task('bulid-debug', function () {
    /*********************   lib start  *********************/
    gulp.src(['src/lib/**'])
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/lib')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/lib')));
    /*********************   lib end  *********************/

    /*********************   common start  *********************/
    gulp.src('src/developer/**')
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/developer')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/developer')));

    gulp.src(['src/assets/**'])
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/assets')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/assets')));

    gulp.src(['src/component/**', '!src/component/scss/*.scss'])
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/component')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/component')));

    gulp.src(['src/component/scss/rt.theme.scss']).pipe(sass().on('error', sass.logError))
        .pipe(concat('rt.xmobile.theme.css'))
        .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
        .pipe(gulpif(IS_RELEASE_BUILD, rename({ extname: '.min.css' })))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/component/css')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/component/css')));
    /*********************   common end  *********************/

    /*********************   module start  *********************/
    gulp.src('src/module/**/*Module.js')
        .pipe(concat('modules.js'))
        .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
        .pipe(gulpif(IS_RELEASE_BUILD, rename({ extname: '.min.js' })))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/module')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/module')));

    gulp.src('src/module/**/*Service.js')
        .pipe(concat('services.js'))
        .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
        .pipe(gulpif(IS_RELEASE_BUILD, rename({ extname: '.min.js' })))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/module')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/module')));

    gulp.src('src/module/**/*Controller.js')
        .pipe(concat('controllers.js'))
        .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
        .pipe(gulpif(IS_RELEASE_BUILD, rename({ extname: '.min.js' })))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/module')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/module')));

    gulp.src('src/module/*/language/*.js')
        .pipe(concat('languages.js'))
        .pipe(gulpif(IS_RELEASE_BUILD, uglify()))
        .pipe(gulpif(IS_RELEASE_BUILD, rename({ extname: '.min.js' })))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/module')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/module')));

    gulp.src('src/module/**/*.html')
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/module')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/module')));

    /*********************   module end  *********************/

    var min = IS_RELEASE_BUILD ? ".min" : "";

    var jsExt = min + '.js?v=' + version;
    var cssExt = min + '.css?v=' + version;

    var cssList = conf.cssList || [];
    var jsList = conf.jsList || [];

    gulp.src('src/index.html')
        .pipe(htmlreplace({
            css: cssList,
            js: jsList.concat([
                "module/modules" + jsExt,
                "module/services" + jsExt,
                "module/controllers" + jsExt,
                "module/languages" + jsExt
            ])
        }))
        .pipe(gulpif(IS_WECHAT, gulp.dest(dest_wechat + '/')))
        .pipe(gulpif(IS_APP, gulp.dest(dest_app + '/')));
});


// 注册缺省任务
gulp.task('default', ['jshint', 'bulid-debug']);
