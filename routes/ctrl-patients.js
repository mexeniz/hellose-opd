var express = require('express');
var router = express.Router();
module.exports = router;

var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');
var MedicalRecord = mongoose.model('MedicalRecord');
var Prescription = mongoose.model('Prescription');
var Disease = mongoose.model('Disease');

/* GET patients page. */
router.get('/', function(req, res, next) {
  res.render('patients/index');
});

// Warehouse for patient list
router.get('/store', function(req, res, next) {
  Patient.find(function(err, patient){
    // Check if error
    if(err) { return next(err); }
    res.json(patient);
  });
});


// Information for each patient
router.get('/:patid', function(req, res, next) {
  res.render("patients/info", { patient_id: req.params.patid});
});

router.post('/insert', function(req, res, next) {
  var patient = new Patient(req.body);
  patient.save(function(err, patient){
    if(err){ return next(err); }
    res.json(patient);
  });
});

// Physical Record for individual patient
router.get('/info/:patid', function(req, res, next) {
  var id = req.params.patid;
    Patient.findOne({patient_id: id})
          .populate('physical_record')
          .populate('medical_record')
          .populate('prescription_record')
          .exec(function(err, patient) {
              if(err) {
                return res.json(500, {
                    message: 'Error getting patient.'
                });
              }
              if(!patient) {
                  return res.json(404, {
                      message: 'Patient not found!'
                  });
              }

              var options = {
                path: 'medical_record.diseases',
                model: 'Disease'
              };
              
              // Get disease info and return it
              Patient.populate(patient, options, function (err, patient) {
                if(err) return next(err);

                var options2 = {
                  path: 'prescription_record.med_dosage_list.medicine',
                  model: 'Medicine'
                };

                // Get medicine info
                Patient.populate(patient, options2, function(err, patient) {
                  if(err) return next(err);
                  res.json(patient);
                });
                
              });

          });

});


/*
router.param('patient', function(req, res, next, id) {
  Patient.findOne({patient_id : id} , function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find post')); }
    console.log(patient) ;
    req.patient = patient;
    return next();
  });
});
*/
