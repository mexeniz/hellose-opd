var express = require('express');
var router = express.Router();
var passport = require('passport');
module.exports = router;


var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('main/login');
});
/* GET home page. */
router.get('/home', isAuthenticated, function(req, res, next) {
	console.log(req.user);
	/*if(req.user.role !== 'doctor') 
	{
		res.render('error', {
	      message: 'You are just a ' + req.user.role + '!',
	      error: { status: 401 }
	    });
	    return;
	}*/
  res.render('main/home');
});

/* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('main/testRegister',{message: req.flash('message')});
  });
 
  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true 
  }));

  /* Handle Logout */
router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});



router.get('/prescriptions', function(req, res, next) {
  res.render('pharmacist/prescription');
});

