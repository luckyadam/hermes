var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var beautify = require('gulp-beautify');

gulp.task('build', function () {
  gulp.src([
    'script/start.js',
    'script/util.js',
    'script/loader.js',
    'script/auto_statistics.js',
    'script/end.js'
  ]).pipe(concat('loader.js'))
    .pipe(beautify({ indentSize: 2 }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename('loader.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('script/*.js', ['build']);
});


gulp.task('default', ['build', 'watch']);
