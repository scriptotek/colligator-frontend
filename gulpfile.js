// Include gulp
var gulp = require('gulp');

// Include plugins
var notify = require('gulp-notify'),
	bower = require('gulp-bower'),
	jshint = require('gulp-jshint')
	usemin = require('gulp-usemin')
	uglify = require('gulp-uglify')
	minifyCss = require('gulp-minify-css')
	header = require('gulp-header');

// Lint task. Only for our own js files located in /js
gulp.task('lint', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Minify task. Minifies and concats js and css as marked in index.html, but only after the lint task is done.
gulp.task('minify', ['lint'], function() {
	// We use a return statement because the result of this will be returned to the default task (see below) when done. In other words: The default task will work on the result of this minify task.
	return gulp.src('index.html')
			.pipe(usemin({
				css: [minifyCss(), 'concat'],
				js: [uglify(), 'concat']
			}))
			.pipe(gulp.dest('dist'));
});

// Header task. Include a note that the files are automatically generated, so that no one edits them.
gulp.task('add-headers', ['minify'], function(){
	gulp.src('dist/index.html')
		.pipe(header('<!-- This file is generated - do not edit by hand! -->\n'))
		.pipe(gulp.dest('dist/'));

	gulp.src('dist/js/scripts.js')
		.pipe(header('/* This file is generated - do not edit by hand */\n'))
		.pipe(gulp.dest('dist/js'));

	gulp.src('dist/css/style.css')
		.pipe(header('/* This file is generated - do not edit by hand */\n'))
		.pipe(gulp.dest('dist/css'));
});

// Default task
gulp.task('default', ['lint', 'minify', 'add-headers'], function(){});