var express = require('express');
var router = express.Router();
module.exports = router;

//  creating a GET route for retrieving posts
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

// Warehouse for patient list
router.get('/store', function(req, res, next) {
  Patient.find(function(err, patient){
    // Check if error
    if(err) { return next(err); }
    res.json(patient);
  });
});


// Information for each patient
router.get('/:patient_id ', function(req, res, next) {
  res.render("patients/info", { patient_id: req.params.patient_id});
});

router.post('/insert', function(req, res, next) {
  var patient = new Patient(req.body);
  console.log(patient);
  patient.save(function(err, patient){
    if(err){ return next(err); }
    res.json(patient);
  });
});

// Physical Record for individual patient
router.get('/info/:patient', function(req, res, next) {
  req.patient.populate('physical_record', function(err, patient) {
    if (err) { return next(err); }
    res.json(patient);
  });
  /*req.patient.populate('physical_record', function(err, patient) {
      if (err) { return next(err); }
      req.patient.populate('medical_record', function(err, patient) {
        if (err) { return next(err); }
        res.json(patient);
  });
  });*/
});

router.param('patient', function(req, res, next, id) {
  Patient.find({patient_id : id} , function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find post')); }
    console.log(patient) ;
    req.patient = patient;
    return next();
  });
});
