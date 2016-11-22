const gulp = require('gulp');
const gulpClean = require('gulp-clean');
const gulpShell = require('gulp-shell');
// const jasmineBrowser = require('gulp-jasmine-browser');
const webpack = require('gulp-webpack');
// const mergeStream = require('merge-stream');

const configs = {
	src: 'src/**.*',
	dist: 'dist',
};


gulp.task('default', ['build', 'clean'], gulpShell.task([
	'./halite -d "30 30" "node ./src/MyBot.js" "node ./dist/MyBot0.js" "node ./dist/MyBot1.js" "node ./dist/MyBot2.js"'
]));

gulp.task('build', ['clean'], function(){
	return appPack()
	    .pipe(gulp.dest(configs.dist));
});

gulp.task('clean', ['cleanLogs', 'cleanHlts'])

gulp.task('cleanLogs', function(){
	return gulp.src('./*.log')
		.pipe(gulpClean());
})

gulp.task('cleanHlts', function(){
	return gulp.src('./*.hlt')
		.pipe(gulpClean());
})

function appPack(){
	const webpackConfig = require('./webpack.config.js');
	return gulp.src(configs.src)
		.pipe(webpack(webpackConfig));
}

// function specSrc(){
// 	return gulp.src('spec/**/*.spec.js')
// 		.pipe(webpack({watch: true}));
// }