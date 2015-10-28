var express = require('express');
var router = express.Router();
module.exports = router;

var mongoose = require('mongoose');
var Prescription = mongoose.model('Prescription');
var Patient = mongoose.model('Patient');

/*
 * Get prescription by patient
 */
router.get('/:patient_id', function(req, res, next) {
  // Get patient id from request data
  var pid = req.params.patient_id;
  console.log('pid = ' + pid);
  
  // Get all prescriptions of this patient
  Prescription.find({ patient: pid })
    .populate('patient')
    .exec(function(err, prescriptions) {
      if(err) {
        console.log(err);
        return res.json(500, {
            message: 'Error getting prescription.'
        });
      }
      
      res.json(prescriptions);

    });
});

// Add new prescription
router.post('/insert/:patient_id', function(req, res, next) {
  console.log(req.body);
  var prescription = new Prescription(req.body);

  // Add prescription to patient's prescription record
  prescription.save(function(err, prescription){
    if(err){ return next(err); }
    req.patient.prescription_record.push(prescription);
    req.patient.save(function(err, patient) {
      if(err) { return next(err); }
      // Get medicine data
      prescription.populate('med_dosage_list.medicine', function(err, prescription) {
        if(err){ return next(err); }
        res.json(prescription);
      });
      
    });
    
  });
});

// Update the Physical Record
router.put('/update/:pres_id', function(req, res, next) {
  var oldPres = req.prescription;
  var newPres = req.body;

  oldPres.med_dosage_list = newPres.med_dosage_list;
  oldPres.pharmacist = newPres.pharmacist;

  oldPres.save(function(err, pres) {
    if(err) return next(err);

    pres.med_dosage_list = newPres.med_dosage_list;
    pres.populate('med_dosage_list.medicine', function(err, pres) {
      if(err) return next(err);
      res.json(pres);
    });
    
  });

});

// Delete prescription
router.delete('/delete/:pres_id', function(req, res, next) {
    req.prescription.remove(function(err) {
      if(err) {
          return next(err);
        }

        res.json({ message: 'Successfully deleted' });
    });
});

// Get patient data
router.param('patient_id', function(req, res, next, id) {
  Patient.findOne({_id : id} , function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find patient')); }
    req.patient = patient;
    return next();
  });
});

// Get prescription data
router.param('pres_id', function(req, res, next, id) {
  Prescription.findById(id , function (err, prescription){
    if (err) { return next(err); }
    if (!prescription) { return next(new Error('can\'t find prescription')); }
    req.prescription = prescription;
    return next();
  });
});