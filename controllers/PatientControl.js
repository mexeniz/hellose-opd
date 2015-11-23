'use strict';

var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');

module.exports.editPatientInfo = function(patId, newPat, callback)
{
	// Find patient
	Patient.findById(patId, function (err, oldPat){
		if(err) { return callback(err); }

		// Update prescription
		oldPat = newPat;
		// Save it
		oldPat.save(function(err, patient) {

			if(err) { return callback(err); }

			// pres.med_dosage_list = newPres.med_dosage_list;
			// Populate new med dosage
			// pres.populate('med_dosage_list.medicine', callback);
			callback(null, patient);
		});

	});

};