'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var RoundWardControl = require('./RoundWardControl.js');

module.exports.generate = function(){
	var data = {
		patient: mongoose.Types.ObjectId('564ecbd6bd46ea782b4df536'),
		doctor: mongoose.Types.ObjectId('564ec7d6324f8c3524d153f6'),
		roundWard: mongoose.Types.ObjectId('564ec7950fdb9ad8266f7cc1') , //2015-01-11 AM 564ec7950fdb9ad8266f7cbd
		//PM 564ec7950fdb9ad8266f7cc1
		slot: 10,
		status: "testStatus"
	};
	var appointment = new Appointment(data);
	appointment.save(function(err,result){
	});
};

//CONFLICT WITH RoundwardControl.js
module.exports.getEarliestDateTime = function(doctorIdentity, amount , callback)
{
	var busy = [];
	Doctor.findById(mongoose.Types.ObjectId("564ec7d6324f8c3524d153f6")).exec()
	.then(function(thisDoctor){
		if(thisDoctor ===null){
			return callback("NO DOC FOUND");
		}
		busy = thisDoctor.onDutyRoundward;
	}).then(function(){
		console.log(busy);
	});
	
};

module.exports.checkAppointment = function(patientId, selectedType, doctorId, department, symptom)
{

};



module.exports.createAppointment = function(appInfo, callback){
	// Guaranteed that input appinFo is valid
	/*appInfo
			-doctor_id ( NO-firstname , NO-lastname ) //Doctor id is pass from frontend
			-patientid  //From  User's Session  (REQ.USER._ID)
			-slot // Slot to CreateAppointment - Valid and always Free 
			(only freeslot choice is shown , so input is freeslot)
			-status //Archan said that give it a field 
	*/
	//Find Correspondent Doctor to add the Appointment with
	var thisDoctor;
	var packed = {};

	User.findOne({firstname:appInfo.doctor_id, lastname: appInfo.lastname}).exec()
	.then(function(thisDoctorFromDb){
		thisDoctor = thisDoctorFromDb;
		return Roundward.findOne({date: appInfo.date,time:appInfo.time}).exec();
	})
	.exec(function(roundward){
		packed.roundward = roundward._id;
		packed.doctor = thisDoctor._id;
		packed.patient = appInfo.patientid;
		packed.slot = appInfo.slot;
		packed.status = appInfo.status;
		//WE GOT DATA
		var appointment = new Appointment(packed);
		appointment.save(function(err,result){
		});
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