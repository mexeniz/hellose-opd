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

router.get('/doctor/roundward', function(req, res, next) {
  res.render('material_doctor/roundward_schedule');
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

router.get('/pharmacist/prescription', function(req, res, next) {
  res.render('material_pharmacist/list_prescription');
});
/*
STAFF
*/
router.get('/staff/', function(req, res, next) {
  res.render('material_staff/home');
});

router.get('/staff/import_roundward', function(req, res, next) {
  res.render('material_staff/import_roundward');
});

router.get('/staff/patient', function(req, res, next) {
  res.render('material_staff/list_patient');
  origin/waterfall-init
});