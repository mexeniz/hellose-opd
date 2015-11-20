'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var RoundWardControl = require('./RoundWardControl.js');

module.exports.getEarliestDateTime = function(doctorId, callback)
{

	
};

module.exports.checkAppointment = function(patientId, selectedType, doctorId, department, symptom)
{

};

module.exports.createAppointment = function(appInfo, callback)
{
	var app = new Appointment(appInfo);
	app.save(function(err, data) {
		if(err) { callback(err); }
		// Send SMS
		callback(err, data);
	});
};

module.exports.updateAppointments = function(date, time)
{

};

module.exports.cancelAppointment = function(appId)
{

};

module.exports.editAppointment = function(appInfo)
{
	var app = new Appointment(appInfo);
	app.save(function(err, data) {
		if(err) { callback(err); }
		// Send SMS
		callback(err, data);
	});
};

module.exports.viewDoctorAppointment = function(patientId, callback)
{
	// Find all appointments of this patient
	Appointment.find({ patient: mongoose.Types.ObjectId(patientId) }, function(err, apps) {
		if(err) return callback(err);
		callback(err, apps);
	});

};

module.exports.viewPatientAppointment = function(doctorId)
{
	// Find app appointment of this doctor
	Appointment.find({ doctor: mongoose.Types.ObjectId(doctorId) }, function(err, apps) {
		if(err) return callback(err);
		callback(err, apps);
	});
	// Send back to client
};