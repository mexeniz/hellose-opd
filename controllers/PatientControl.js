'use strict';

var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var User = mongoose.model('User');

module.exports.editPatientInfo = function(patId, newPat, callback)
{
	// Find patient
	User.findById(patId, function (err, oldPat){
		if(err) { return callback(err); }

		// Update prescription
		oldPat.firstname = newPat.firstname;
		oldPat.lastname = newPat.lastname;
		oldPat.gender = newPat.gender;
		oldPat.email = newPat.email;
		oldPat.address = newPat.address;
		oldPat.ssn = newPat.ssn;
		oldPat.blood_type = newPat.blood_type;
		oldPat.birthdate = newPat.birthdate;
		oldPat.tel_number = newPat.tel_number;

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