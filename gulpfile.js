var fs = require('fs');
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var setup = require('./setup/setup');
var args = require('process.args')();
var appName = args['package']==undefined?"":args['package'].name;
/**
 * 清理tmp
 */
gulp.task('clean', function(){
    return gulp.src('tmp', {read: false,force: true}).pipe(clean());
});


/**
 * 拷贝App文件
 */
gulp.task('copy-app',function() {
    gulp.src(['app/data/*.*']).pipe(gulp.dest('tmp/data'));
    gulp.src(['app/dist/**/*.*']).pipe(gulp.dest('tmp/dist'));
    return true;
});

/**
 * 拷贝nw运行包
 */
gulp.task('copy-node-webkit',function() {
    if(appName == 'xlcb'){
        gulp.src(['node_webkit/xlcb/*.*']).pipe(gulp.dest('tmp'));
    }else{
        gulp.src(['node_webkit/common/*.*']).pipe(gulp.dest('tmp'));
    }
    gulp.src(['node_webkit/*.*']).pipe(gulp.dest('tmp'));
    return true;
});


/**
 * 拷贝node模块
 */
gulp.task('copy-node-modules',function() {
  return gulp.src([
    'node_modules/**/*.*',
    '!node_modules/gulp*/**/*.*',
    '!node_modules/run-sequence/**/*.*',
    '!node_modules/process.args/**/*.*'
  ]).pipe(gulp.dest('tmp/node_modules'));
});

/**
 * 拷贝配置文件
 */
gulp.task('create-package-json',function() {
    return gulp.src(['app/package.json']).pipe(gulp.dest('tmp'));
});

/**
 * exe重命名
 */
gulp.task('exe-rename', function (cb) {
     fs.rename('tmp/hisign.exe', 'tmp/'+setup.exeConfig[appName], function () {
         cb();
     });
});

/**
 * InnoSetup打包
 */
gulp.task('exe-package', shell.task([
  setup.InnoSetupPath + ' "' + setup.InnoSetupConfig + 'setup_' + appName + '.iss"'
]));

/**
 * 入口
 */
gulp.task('package', function(){
  if(!appName || !setup.exeConfig[appName]){
      console.log('未传递工程名称或名称有误(例如gulp package -name=ythpt)');
      return;
  }
  runSequence(
      'clean',
        [
         'copy-app',
         'copy-node-modules',
         'copy-node-webkit'
       ],
      'create-package-json',
      'exe-rename',
      'exe-package',
      'clean'
  );
});

/**
 * 入口
 */
gulp.task('default', function(){
   console.log('请运行gulp package -name=工程名称');
    return;
});


