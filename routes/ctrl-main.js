var express = require('express');
var router = express.Router();
module.exports = router;


<<<<<<< HEAD
//  creating a GET route for retrieving posts
=======
>>>>>>> master
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

<<<<<<< HEAD
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main/index');
});
router.get('/patients', function(req, res, next) {
  res.render('patients/index');
=======
/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('main/login');
});
/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('main/home');
>>>>>>> master
});