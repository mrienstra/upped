var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concatCss = require('gulp-concat-css');
var connect = require('gulp-connect');
var flatten = require('gulp-flatten');
var gulpIf = require('gulp-if');
var gutil = require('gulp-util');
var libBundle = require('./gulp-lib-bundle');
var open = require('open');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');



var port = 8000;

var libs = ['react/addons', 'firebase', 'reactfire', 'moment', 'lodash', 'when', 'pubsub-js', '../lib/openfb-32c04deef7-mod.js', '../lib/noTouchendAfterTouchmove.js', '../lib/swipe-stack-0.1.js'];

var cssLibs = 'src/lib/{ionic-1.0.0/css/ionic,swipe-stack-0.1}.css';

var mainJsFile = 'src/script/main.js';
var parseJsFile = 'src/lib/parse-1.2.18/parse-1.2.18.min.js';
var mainSassFile = 'src/style/main.scss';
var sassIncludePaths = ['src/style'];

// ToDo: Only output mocks in 'dev' mode, not 'prod' mode
var path = {
  html: {
    in: 'src/*.html',
    out: 'build'
  },
  mocks: {
    in: 'src/mocks/*.html',
    out: 'build/mocks'
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
    in: 'src/lib/**/*.{ttf,woff,eot,svg}',
    out: 'build/css/ionic-1.0.0/fonts'
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
  libBundle(libs, { path: './src/script/libs.js' }) // Fake path, used by libBundle, do not change
    .pipe(browserify({
      transform: ['reactify'],
      extensions: ['.jsx'],
      debug : !gutil.env.production,
      require: libs
    }))
    .pipe(gulpIf(gutil.env.production, uglify({
      mangle: {
        except: ['require'] // todo: Necessary? Useful?
      }
    })))
    .pipe(gulp.dest(path.script.out));

  gulp.src('src/lib/trackjs-1.2.5.js')
    .pipe(gulp.dest(path.script.out));

  gulp.src(parseJsFile)
    .pipe(gulp.dest(path.script.out));

  gulp.src(cssLibs)
    .pipe(concatCss('libs.css'))
    .pipe(gulp.dest(path.style.out));
});

gulp.task('mocks', function () {
  gulp.src(path.mocks.in)
    .pipe(gulp.dest(path.mocks.out))
    .pipe(connect.reload());
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
    .pipe(flatten())
    .pipe(gulp.dest(path.font.out));
});

gulp.task('watchdog', function () {
  watching = true; // used by `onError`
  gulp.watch(path.html.in, ['html']);
  //gulp.watch(path.mocks.in, ['mocks']);
  gulp.watch(path.script.in, ['script']);
  gulp.watch(path.style.in, ['sass']);
  gulp.watch(path.img.in, ['img']);
  gulp.watch(path.font.in, ['font']);
});

gulp.task('open', function () {
  open('http://localhost:' + port);
});

gulp.task('watch', ['default', 'connect', 'watchdog']);
gulp.task('watchopen', ['default', 'connect', 'watchdog', 'open']);
gulp.task('default', ['html', 'lib', 'script', 'sass', 'img', 'font']); // 'mocks',
