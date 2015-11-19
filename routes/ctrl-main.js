var express = require('express');
var router = express.Router();
var passport = require('passport');
module.exports = router;


var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');
var Middleware = require('../middlewares/Middleware');

/* GET login page. */
router.get('/', function(req, res, next) {
  // If user has logged in, show homepage
  if(req.user)
  {
    res.render('main/home');
  }
  // If not, show login page
  res.render('main/login');
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  // If user is not logged in, redirect to login page
  if(!req.user) return res.redirect('/');

  // If logged in, show homepage
  res.render('main/home');
});

/* GET import schedule page. */
router.get('/import_schedule', function(req, res, next) {
  res.render('mockup/import_schedule');
});
/* GET import schedule page. */
router.get('/create_appointment', function(req, res, next) {
  res.render('mockup/create_appointment');
});

router.get('/patientViewAppointment', function(req,res) {
	res.render('mockup/patientViewAppointment');
  });
/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('main/register');

});

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash : true 
}));

/* GET Registration Page */
router.get('/register', function(req, res){
  res.render('main/register',{message: req.flash('message')});
});

/* Handle Registration POST */
router.post('/register', passport.authenticate('register', {
  successFlash: 'Yeah',
  failureFlash: 'Noooooo'
}));

  /* Handle Logout */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



router.get('/prescriptions', function(req, res, next) {
  res.render('pharmacist/prescription');
});
