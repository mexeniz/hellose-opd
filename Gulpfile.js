'use strict';
//////////////////////////
//Gulp File
//////////////////////////

var gulp = require('gulp');
//var watch = require('gulp-watch');
var nodemon =  require('gulp-nodemon');

//var src = {
//  js: '*.js'
//};

gulp.task('default', function() {
	nodemon(
		{ script: 'bin/www', 
		ext: 'js'}
    ).on('restart', function () {
      	console.log('restart finished due to changes');

    });
});

// gulp.task('default', function() {
// 	//Changes made along *.js file
//   	watch(src.js, { ignoreInitial: false }, function (files) {
//     	console.log("[Changes Detected !!]" + files.path);
//     //Reload the server 
//     nodemon({
// 	    script: 'bin/www'
// 	  , ext: 'js html'
// 	  }).on('restart', function () {
//       			console.log('restarted!')
//     	});
//   });
// });