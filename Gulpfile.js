/*eslint-env node */
/*eslint no-console: "off" */
/* jslint indent: 4 */
/* global require, console */

var gulp = require('gulp'),
    sourceStream = require('vinyl-source-stream'),
    transform = require('vinyl-transform'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    eslint = require('gulp-eslint'),
    exorcist = require('exorcist'),
    replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    prettify = require('gulp-jsbeautifier'),
    ghPages = require('gulp-gh-pages');

gulp.task('browserify', function () {
    var b = browserify({
        debug: true
    });
    b.transform(babelify, {
        presets: ['es2015', 'react'],
        plugins: ['transform-object-rest-spread', 'transform-flow-strip-types', 'transform-class-properties']
    });
    b.add('./assets/js/main.js');
    return b.bundle()
        .pipe(sourceStream('main.js'))
        .pipe(transform(function () {
            return exorcist('dist/main.js.map');
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('browserify-hash-worker', function () {
    var b = browserify({
        debug: true
    });
    b.transform(babelify, {
        presets: ['es2015', 'react'],
        plugins: ['transform-object-rest-spread', 'transform-flow-strip-types', 'transform-class-properties']
    });
    b.add('./assets/js/hash-worker.js');
    return b.bundle()
        .pipe(sourceStream('hash-worker.js'))
        // A better solution would be running Browserify on the entire asmCrypto
        // module but since we're not debugging that module we'll just strip the
        // sourceMapping comment to avoid 404 warnings when opening the debugger
        .pipe(replace('//# sourceMappingURL=asmcrypto.js.map', ''))
        .pipe(transform(function () {
            return exorcist('dist/hash-worker.js.map');
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('static', function () {
    gulp.src(['assets/html/index.html', 'assets/html/help.html'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('sass', function () {
    return gulp.src('assets/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('default', ['lint', 'browserify', 'browserify-hash-worker', 'static', 'sass']);

gulp.task('develop', ['default'], function () {
    var watcher = gulp.watch('assets/**/*.*', ['default']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

});

gulp.task('lint', function () {
    // Note: To have the process exit with an error code (1) on
    //  lint error, return the stream and pipe to failOnError last.
    return gulp.src(['*.js', 'assets/js/*.js', 'assets/jsx/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('prettify', function() {
    gulp.src(['./assets/js/*.js', './assets/jsx/*.jsx'], {base: './'})
        .pipe(prettify())
        .pipe(gulp.dest('./'));
});

gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});
