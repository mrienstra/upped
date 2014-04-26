var gulp = require('gulp');
var browserify = require('gulp-browserify');
var connect = require('gulp-connect');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var libBundle = require('./gulp-lib-bundle');
var open = require('open');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');



var port = 8000;

var libs = ['react/addons', './lib/ratchet-mod.js', 'moment'];

var mainJsFile = 'src/script/main.js';
var mainSassFile = 'src/style/main.scss';
var sassIncludePaths = ['src/style'];

var path = {
  html: {
    in: 'src/*.html',
    out: 'build'
  },
  script: {
    in: 'src/script/**/*.{js,jsx}',
    out: 'build/js'
  },
  style: {
    in: 'src/style/**/*.{css,scss}',
    out: 'build/css'
  },
  img: {
    in: 'src/img/**/*.{png,jpg,jpeg,gif}',
    out: 'build/img'
  },
  font: {
    in: 'src/fonts/**/*.{ttf,woff,eot,svg}',
    out: 'build/fonts'
  },
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
  gulp.src(path.html.in)
    .pipe(gulp.dest(path.html.out))
    .pipe(connect.reload());
});

gulp.task('lib', function () {
  return libBundle(libs, { path: './src/script/libs.js' }) // Fake path, used by libBundle, do not change
    .pipe(browserify({
      debug : !gutil.env.production,
      require: libs
    }))
    .pipe(gulpIf(gutil.env.production, uglify({
      mangle: {
        except: ['require'] // todo: Necessary? Useful?
      }
    })))
    .pipe(gulp.dest(path.script.out));
});

gulp.task('script', function() {
  gulp.src(mainJsFile, { read: false })
    .pipe(browserify({
      transform: ['reactify'],
      extensions: ['.jsx'],
      debug : !gutil.env.production,
      external: libs
    })
    .on('error', onError))
    .pipe(gulpIf(gutil.env.production, uglify({
      mangle: {
        except: ['require'] // todo: Necessary? Useful?
      }
    })))
    .pipe(gulp.dest(path.script.out))
    .pipe(connect.reload());
});

gulp.task('sass', function () {
  gulp.src(mainSassFile)
    .pipe(sass({
      includePaths : sassIncludePaths
    })
    .on('error', onError))
    .pipe(gutil.env.production ? minifyCSS() : gutil.noop())
    .pipe(gutil.env.production ? rev() : gutil.noop())
    .pipe(gulp.dest(path.style.out))
    .pipe(connect.reload());
});

gulp.task('img', function () {
  gulp.src(path.img.in)
    .pipe(gulp.dest(path.img.out))
    .pipe(connect.reload());
});

gulp.task('font', function() {
   gulp.src(path.font.in)
     .pipe(gulp.dest(path.font.out));
});

gulp.task('watchdog', function () {
  watching = true; // used by `onError`
  gulp.watch(path.html.in, ['html']);
  gulp.watch(path.script.in, ['script']);
  gulp.watch(path.style.in, ['sass']);
  gulp.watch(path.img.in, ['img']);
  gulp.watch(path.font.in, ['font']);
  open('http://localhost:' + port);
});

gulp.task('watch', ['default', 'connect', 'watchdog']);
gulp.task('default', ['html', 'lib', 'script', 'sass', 'img', 'font']);