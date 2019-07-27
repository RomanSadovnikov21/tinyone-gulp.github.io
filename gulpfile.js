const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');

sass.compiler = require('node-sass');

const cssFiles = [
  './src/css/main.css',
  './src/css/head.css',
  './src/css/grid.css'
]

const jsFiles = [
  './src/js/lib.js',
  './src/js/main.js'
]

function styles() {
  return gulp.src(cssFiles)
    .pipe(concat('style.css'))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src(jsFiles)
    .pipe(concat('script.js'))
    .pipe(uglify({ toplevel: true }))
    .pipe(gulp.dest('./build/js'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp.src('./src/images/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('build/images'))
}

function clean() {
  return del(['build/*'])
}

function clear() {
  return cache.clearAll()
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    notify: false
  })
  gulp.watch('./src/sass/**/*.+(scss|sass)', gulp.series('sass'))
  gulp.watch('./src/css/**/*.css', styles)
  gulp.watch('./src/js/**/*.js', scripts)
  gulp.watch("./*.html").on('change', browserSync.reload)
}

gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.+(scss|sass)')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./src/css'));
});

gulp.task('styles', gulp.series('sass'), styles);
gulp.task('scripts', scripts);
gulp.task('images', images);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, clear, gulp.parallel(images, styles, scripts)));
gulp.task('dev', gulp.series('build', 'watch'));
