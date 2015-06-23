// Include gulp
var gulp = require('gulp');

// Include plugins
var notify = require('gulp-notify'),
	bower = require('gulp-bower'),
	jshint = require('gulp-jshint');

// Lint task
gulp.task('lint', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// Gulp task
gulp.task('bower', function() {
	return bower()
		.pipe(gulp.dest('?????????????????????????????????????????'))
});

// Watch files for changes
gulp.task('watch', function() {
	gulp.watch('js/*.js', ['lint', 'scripts']);
});

// Default task
gulp.task('default', ['lint', 'watch']);