var express = require('express');
var router = express.Router();
module.exports = router;


var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main/index');
});