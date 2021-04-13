
"use strict";

var _      = require('lodash'),
    gulp   = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

var js = [
    '../../dist/framework/PAKE/SRP/browser.bundle.js'
];

gulp.task('copy-min-js', function () {
    _.forEach(js, function (file, _) {
        gulp.src(file)
            .pipe(uglify())
            .pipe(rename({ extname: '.min.js' }))
            .pipe(gulp.dest('.'))
    });
});

gulp.task('minify', ['copy-min-js']);
