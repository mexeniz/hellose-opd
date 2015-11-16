'use strict';

var mongoose = require('mongoose');
var Prescription = mongoose.model('Prescription');
var Patient = mongoose.model('Patient');

module.exports.getAllPrescriptions = function(callback)
{
	Prescription.find()
		.populate('patient', 'firstname lastname')
		.populate('med_dosage_list.medicine')
		.exec(callback);
};

module.exports.getPrescriptionByPatientId = function(patientId, callback)
{
	var id = mongoose.Types.ObjectId(patientId);

	// Get all prescriptions of this patient
	Prescription.find({ patient:  id})
		.populate('patient')
		.exec(callback);
};

module.exports.addPrescription = function(patientId, prescriptionData, callback)
{
	var prescription = new Prescription(prescriptionData);

	// Find patient
	Patient.findOne({_id : patientId} , function (err, patient){
		if(err) { return callback(err); }

		// Add prescription to patient's prescription record
		prescription.save(function(err, prescription){

			if(err){ return callback(err); }
			patient.prescription_record.push(prescription);
			patient.save(function(err, patient) {
				if(err) { return callback(err); }
				// Get medicine data
				prescription.populate('med_dosage_list.medicine', callback);
			});

		});

	});	
};

module.exports.editPrescription = function(presId, newPres, callback)
{
	// Find prescription
	Prescription.findById(presId, function (err, oldPres){
		if(err) { return callback(err); }

		// Update prescription
		oldPres.med_dosage_list = newPres.med_dosage_list;
		oldPres.pharmacist = newPres.pharmacist;

		// Save it
		oldPres.save(function(err, pres) {

			if(err) { return callback(err); }

			pres.med_dosage_list = newPres.med_dosage_list;
			// Populate new med dosage
			pres.populate('med_dosage_list.medicine', callback);
		});

	});

};

module.exports.removePrescription = function(presId, callback)
{
	// Find prescription
	Prescription.findById(presId, function (err, pres){
		if(err) { return callback(err); }

		// Remove it from database
		pres.remove(callback);

	});
};

module.exports.completePrescription = function(presId, callback)
{
	Prescription.findById(presId, function (err, pres){
		if(err) { return callback(err); }

		// Change status to complete
		pres.status = 'Completed';
		pres.save(function(err, pres) {

			if(err) { return callback(err); }
			// Populate new med dosage
			pres.populate('med_dosage_list.medicine', callback);
		});
	});
};