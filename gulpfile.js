var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var rev = require('gulp-rev-mtime');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

var templateCache = require('gulp-angular-templatecache');


gulp.task('default', function () {
    gulp.src('app/**/*.html')
        .pipe(templateCache({ module:'templatesCache', standalone:true}))
        .pipe(gulp.dest('www/'))
        .on('end', function() {
            gulp.src(['app/**/*.js', '!app/**/MockUpdateService.js'])
                .pipe(concat('app.js'))
                .pipe(gulp.dest('www/')).on('end', function() {
                    gulp.src(['app/**/*.js', '!app/**/UpdateService.js'])
                        .pipe(concat('app-browser.js'))
                        .pipe(gulp.dest('www/')).on('end', function() {
                            gulp.src(['www/browser.html'])
                                .pipe(rev({cwd:'www/'}))
                                .pipe(gulp.dest('www/'));
                        })

                })
        })

});



