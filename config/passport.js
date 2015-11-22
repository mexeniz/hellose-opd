var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var UserControl = require('../controllers/UserControl.js');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('login', new LocalStrategy({
    passReqToCallback : true
  }, UserControl.login));

passport.use('register', new LocalStrategy({
    passReqToCallback : true
  }, UserControl.register)
);