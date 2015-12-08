'use strict';

var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var User = mongoose.model('User');

module.exports.editPatientInfo = function(patId, newProfile, callback)
{
	// Find patient
	User.findById(patId, function (err, oldUser){
		if(err) { return callback(err); }

		// Update prescription
		oldUser.firstname = newProfile.firstname;
		oldUser.lastname = newProfile.lastname;
		oldUser.gender = newProfile.gender;
		oldUser.email = newProfile.email;
		oldUser.address = newProfile.address;
		oldUser.ssn = newProfile.ssn;
		oldUser.birthdate = newProfile.birthdate;
		oldUser.telNum = newProfile.telNum;

		// first change patient bloodType
		var query = {};
		query.userId = patId;

		Patient.findOne(query, function(err, patient){
			if(err) { return callback(err); }

			patient.blood_type = newProfile.blood_type;

			patient.save(function(err){
				if(err) { return callback(err); }

				oldUser.save(function(err, user) {

					if(err) { return callback(err); }

					// pres.med_dosage_list = newPres.med_dosage_list;
					// Populate new med dosage
					// pres.populate('med_dosage_list.medicine', callback);
					callback(null, user);
				});
			});
		});

	});

};