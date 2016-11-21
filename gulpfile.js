const gulp = require('gulp');
// const jasmineBrowser = require('gulp-jasmine-browser');
const webpack = require('gulp-webpack');
// const mergeStream = require('merge-stream');


const configs = {
	src: 'src/**.*',
	dist: 'dist',
};

gulp.task('default', function() {
	return appPack()
	    .pipe(gulp.dest(configs.dist));
});

function appPack(){
	const webpackConfig = require('./webpack.config.js');
	return gulp.src(configs.src)
		.pipe(webpack(webpackConfig));
}

// function specSrc(){
// 	return gulp.src('spec/**/*.spec.js')
// 		.pipe(webpack({watch: true}));
// }