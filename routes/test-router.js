var express = require('express');
var router = express.Router();

module.exports = router;


/*
PATIENT
*/
router.get('/patient/', function(req, res, next) {
  res.render('material_patient/home');
});

router.get('/patient/profile', function(req, res, next) {
  res.render('material_patient/view_profile');
});

router.get('/patient/', function(req, res, next) {
  res.render('material_patient/home');
});

/*
DOCTOR
*/
router.get('/doctor/', function(req, res, next) {
  res.render('material_doctor/home');
});

router.get('/doctor/profile', function(req, res, next) {
  res.render('material_doctor/view_profile');
});

router.get('/doctor/appointment', function(req, res, next) {
  res.render('material_doctor/list_appointment');
});

router.get('/doctor/appointment/view', function(req, res, next) {
  res.render('material_doctor/view_appointment');
});
/*
PHARMACIST
*/
router.get('/pharmacist/', function(req, res, next) {
  res.render('material_pharmacist/home');
});

router.get('/pharmacist/profile', function(req, res, next) {
  res.render('material_pharmacist/view_profile');
});