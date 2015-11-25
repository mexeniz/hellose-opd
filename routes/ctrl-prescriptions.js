var express = require('express');
var router = express.Router();
module.exports = router;

var mongoose = require('mongoose');
var PrescriptionControl = require('../controllers/PrescriptionControl');
var Prescription = mongoose.model('Prescription');

/*
 * Get prescription by patient
 */
router.get('/patient/:patient_id', function(req, res, next) {
  var patientId = req.params.patient_id;

  PrescriptionControl.getPrescriptionByPatientId(patientId, function(err, result)
    {
      if(err) { next(err); }
      res.json(result);
    });
});

// Get all prescriptions
router.get('/list', function(req, res, next){ 

  PrescriptionControl.getAllPrescriptions(function(err, pres) {
    if(err) { next(err); }
      var options2 = {
        path: 'patient',
        model: 'Patient'
      };
      // Get medicine info
      Prescription.populate(pres, options2, function(err, patient) {
        if(err){ return next(err);}
          // Get medicine info
          Prescription.populate(patient, {path : 'patient.userId' , model : 'User'}, function(err, result) {
            if(err){ return next(err);}
            res.json(result);
          });
      });
  });

});

// Add new prescription
router.post('/insert/:patient_id', function(req, res, next) {
  console.log('insert ' + req.params.patient_id);
  var prescriptionData = req.body;
  PrescriptionControl.addPrescription(req.params.patient_id, prescriptionData, function(err, result) {
    if(err) { next(err); }
    res.json(result);
  });

});

// Update the Physical Record
router.put('/update/:pres_id', function(req, res, next) {

  var presId = req.params.pres_id;
  var newPres = req.body;

  PrescriptionControl.editPrescription(presId, newPres, function(err, result) {
    if(err) { next(err); }
    res.json(result);
  });

});

// Delete prescription
router.delete('/delete/:pres_id', function(req, res, next) {
  var presId = req.params.pres_id;

  PrescriptionControl.removePrescription(presId, function(err, result) {
    if(err) { next(err); }
    res.json(result);
  });
});

// Complete Prescription
router.post('/complete/:pres_id', function(req, res, next){
  var presId = req.params.pres_id;

  PrescriptionControl.completePrescription(presId, function(err, result){
    if(err) { next(err); }
    res.json(result);
  });
});