var express = require('express');
var router = express.Router();
module.exports = router;


var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('main/login');
});
/* GET home page. */
router.get('/home', function(req, res, next) {
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
/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('main/register');
});