var gulp = require('gulp');
var browserify = require('gulp-browserify');
var connect = require('gulp-connect');
var extReplace = require('gulp-ext-replace');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var open = require('open');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

var mainJsFile = 'src/script/main.js';
var mainSassFile = 'src/style/main.scss';

var port = 8000;

var browserifyConfig = {
  transform: ['reactify'],
  extensions: ['.jsx'],
  debug : !gutil.env.production
};

var sassConfig = {
  includePaths : ['src/style']
};

var path = {
  html: 'src/*.html',
  script: ['src/script/**/*.{js,jsx}'],
  style: ['src/style/**/*.{css,scss}'],
  img: 'src/img/**/*.{png,jpg,jpeg,gif}',
  font: 'src/fonts/**/*.{ttf,woff,eot,svg}'
}

// Handle errors

var watching = false;
var onError = function (err) {
  console.error(err.toString());
  gutil.beep();
  if (watching) {
    this.emit('end');
  } else {
    process.exit(1);
  }
}

// Tasks

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    port: port,
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src(path.html)
    .pipe(gulp.dest('build'))
    .pipe(connect.reload());
});

gulp.task('script', function() {
  gulp.src(mainJsFile)
    .pipe(browserify(browserifyConfig).on('error', onError))
    .pipe(gulpIf(gutil.env.production, uglify({
      mangle: {
        except: ['require'] // todo: Necessary? Useful?
      }
    })))
    .pipe(extReplace('.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
});

gulp.task('sass', function () {
  gulp.src(mainSassFile)
    .pipe(sass(sassConfig).on('error', onError))
    .pipe(gutil.env.production ? minifyCSS() : gutil.noop())
    .pipe(gutil.env.production ? rev() : gutil.noop())
    .pipe(gulp.dest('build/css'));
});

gulp.task('img', function () {
  gulp.src(path.img)
    .pipe(gulp.dest('build/img'))
    .pipe(connect.reload());
});

gulp.task('font', function() {
   gulp.src(path.font)
   .pipe(gulp.dest('build/fonts'));
});

gulp.task('watchdog', function () {
  watching = true; // used by `onError`
  gulp.watch(path.html, ['html']);
  gulp.watch(path.script, ['script']);
  gulp.watch(path.style, ['sass']);
  gulp.watch(path.img, ['img']);
  gulp.watch(path.font, ['font']);
  open('http://localhost:' + port);
});

gulp.task('watch', ['default', 'connect', 'watchdog']);
gulp.task('default', ['html', 'script', 'sass', 'img', 'font']);