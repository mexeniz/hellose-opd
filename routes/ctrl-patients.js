var express = require('express');
var router = express.Router();
module.exports = router;


//  creating a GET route for retrieving posts
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');


router.get('/list', function(req, res, next) {
  
  Patient.find(function(err, patient){
    if(err){ return next(err); }
    res.json(patient);
  });
});

router.get('/',function(req,res,next){
  console.log("HI THERE");
  res.render('patients/index');
});

router.get('/:patient', function(req, res, next) {
  req.patient.populate('physical_record', function(err, patient) {
    if (err) { return next(err); }
    console.log('Retreive Patient '+patient);
    res.json(patient);
  });
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