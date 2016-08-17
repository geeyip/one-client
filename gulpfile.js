var fs = require('fs');
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var setup = require('./setup/setup');

/**
 * 清理tmp
 */
gulp.task('clean', function(){
    return gulp.src('tmp', {read: false,force: true}).pipe(clean());
});


/**
 * 拷贝App
 */
gulp.task('copy-app',function() {
    return gulp.src(['dist/**/*.*']).pipe(gulp.dest('tmp/dist'));
});


/**
 * 拷贝nw运行包
 */
gulp.task('copy-node-webkit',function() {
  return gulp.src(['node_webkit/*.*']).pipe(gulp.dest('tmp'));
});

/**
 * 拷贝data
 */
gulp.task('copy-data',function() {
    return gulp.src(['data/*.*']).pipe(gulp.dest('tmp/data'));
});


/**
 * 拷贝node模块
 */
gulp.task('copy-node-modules',function() {
  return gulp.src([
    'node_modules/**/*.*',
    '!node_modules/gulp*/**/*.*',
    '!node_modules/run-sequence/**/*.*'
  ]).pipe(gulp.dest('tmp/node_modules'));
});

/**
 * 拷贝配置文件
 */
gulp.task('create-package-json',function() {
    return gulp.src(['package.json']).pipe(gulp.dest('tmp'));
});


/**
 * InnoSetup打包
 */
gulp.task('exe-package', shell.task([
  setup.InnoSetupPath + ' "' + setup.InnoSetupConfig + '"'
]));

/**
 * 入口
 */
gulp.task('default', function(){
  runSequence(
      'clean',
        [
         'copy-app',
         'copy-node-modules',
         'copy-node-webkit',
         'copy-data'
       ],
       'create-package-json',
      'exe-package',
      'clean'
  );
});
