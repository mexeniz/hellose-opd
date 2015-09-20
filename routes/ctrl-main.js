var express = require('express');
var router = express.Router();
module.exports = router;


//  creating a GET route for retrieving posts
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main/index');
});
router.get('/patients', function(req, res, next) {
  res.render('patients/index');
});