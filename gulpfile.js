const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const _gulpAutoprefixer = require('gulp-autoprefixer');
const autoprefixer =
  typeof _gulpAutoprefixer === 'function'
    ? _gulpAutoprefixer
    : _gulpAutoprefixer && _gulpAutoprefixer.default
    ? _gulpAutoprefixer.default
    : _gulpAutoprefixer;
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

const paths = {
  scss: './assets/quiz-multistep.scss',
  cssDest: './assets/',
  js: './assets/quiz-multistep.js',
  jsDest: './assets/',
};

gulp.task('multistep-quiz-scss', function () {
  return gulp
    .src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
      })
    )
    .pipe(cleanCSS({ level: 2 }))
    .pipe(rename({ basename: 'quiz-multistep', suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.cssDest));
});

gulp.task('minify-quiz-js', function () {
  return gulp
    .src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename({ basename: 'quiz-multistep', suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.jsDest));
});

gulp.task('watch', function () {
  gulp.watch('./assets/**/*.scss', gulp.series('multistep-quiz-scss'));
  gulp.watch(paths.js, gulp.series('minify-quiz-js'));
});

gulp.task('default', gulp.series('multistep-quiz-scss', 'minify-quiz-js', 'watch'));
