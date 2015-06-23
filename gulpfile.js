// Include gulp
var gulp = require('gulp');

// Include plugins
var notify = require('gulp-notify'),
	bower = require('gulp-bower'),
	jshint = require('gulp-jshint')
	usemin = require('gulp-usemin')
	uglify = require('gulp-uglify')
	minifyCss = require('gulp-minify-css');

// Lint task
gulp.task('lint', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Default
gulp.task('default', function() {
	gulp.src('index.html')
		.pipe(usemin({
			css: [minifyCss(), 'concat'],
			js: [uglify(), 'concat']
		}))
		.pipe(gulp.dest('dist'));
});