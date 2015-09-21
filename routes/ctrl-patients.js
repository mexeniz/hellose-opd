var express = require('express');
var router = express.Router();
module.exports = router;


//  creating a GET route for retrieving posts
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');


router.get('/', function(req, res, next) {
  
  Patient.find(function(err, patient){
    if(err) { return next(err); }
    res.render("patients/index");
  });
});

// Warehouse for patient list
router.get('/store', function(req, res, next) {
  Patient.find(function(err, patient){
    if(err){ return next(err); }
    res.json(patient);
  });
});

router.get('/infostore/:patient_id', function(req, res, next) {
  var param = req.params.patient_id;
  console.log(param);
  Patient.findOne({_id: mongoose.Types.ObjectId(param)}, function(err, patient) {
    if (err) { return next(err); }
    patient.populate('physical_record', function(err, physical_record) {
      if (err) { return next(err); }
      res.json(physical_record);
    });
  });
});

router.post('/test', function(req, res, next) {
    res.json(req.body);
});


// Information for each patient
router.get('/:patient', function(req, res, next) {
  res.render("patients/info");
});


router.post('/insert', function(req, res, next) {
  var patient = new Patient(req.body);
  patient.save(function(err, patient){
    if(err){ return next(err); }

    res.json(patient);
  });
});

router.post('/:patient/physicalrecord/insert', function(req, res, next) {
  var physicalRecord = new PhysicalRecord(req.body);
  physicalRecord.save(function(err, physicalRecord){
    if(err){ return next(err); }
    req.patient.physical_record.push(physicalRecord._id);
    req.patient.save(function(err, patient) {
      if(err){ return next(err); }
      res.json(physicalRecord);
    });
  });
});

router.param('patient', function(req, res, next, id) {
  var query = Patient.findById(id);

  query.exec(function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find post')); }

    req.patient = patient;
    return next();
  });
});