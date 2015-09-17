'use strict';
//////////////////////////
//Gulp File
//////////////////////////

var gulp = require('gulp');
var watch = require('gulp-watch');
var server = require('gulp-express');

var src = {
  js: '*.js'
};


// gulp.task('default', function() {
//   watch(src.js, { ignoreInitial: false }, function (files) {
//     //Changes made along *.js file
//     console.log("Changes Detected !! on file +" + files.path);
//     //Reload the server 
//     server.run(['./bin/www'], ['DEBUG=dsgstyleguide:*']);

//     gulp.watch(src.js, [server.run]);
    
//   });
// });

gulp.task('server', function () {
    // Start the server at the beginning of the task 
    server.run(['./bin/www'], ['DEBUG=dsgstyleguide:*']);

    // Restart the server when file changes 
    gulp.watch(src.js, function(event){
        console.log('JS File changes Detected !! ['+files.path+']');
        server.run(event);
    });

});

gulp.task('default', ['server'], function() {

});