'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var RoundWardControl = require('./RoundWardControl.js');
var Patient = mongoose.model('Patient');

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
			-status //{ok,canceled}
			-date time
	*/
	//Find Correspondent Doctor to add the Appointment with
	var thisDoctor;
	var packed = {};
	//console.log(appInfo);
	//FIND THE ROUNDWARD FIRST 
	var promise = Roundward.findOne({'date':appInfo.date , 'time': appInfo.time}).exec();

	promise.then(function(roundward){
		if(roundward === null){
			//No Roundward = no doctor = no appointment can be made
			callback('no roundward');
			throw new Error('no roundward');
		}else{
		//Have Roundward
			return Appointment.findOne({'roundWard' : roundward._id,'slot':appInfo.slot}).exec();
		}
	})
	.then(function(appointments){
		console.log(appointments);
		if(appointments === null){
			return User.findOne({'_id':appInfo.doctor_id}).exec();
		}else{
			//There already have the appointment in the slot and roundward
			callback('no slot');
			throw new Error('no slot');
		}
	})
	.then(function(thisDoctorFromDb){
		thisDoctor = thisDoctorFromDb;
		return Roundward.findOne({date: appInfo.date,time:appInfo.time}).exec();
	})
	.then(function(roundward){
		packed.roundWard = roundward._id;
		packed.doctor = thisDoctor._id;
		packed.slot = appInfo.slot;
		packed.status = appInfo.status;
		return Patient.findOne({'userId':appInfo.patientid}).exec()
	}).then(function(patient){
		packed.patient = patient._id;
		var appointment_input = new Appointment(packed);
		appointment_input.save(function(err,result){
			if(err){
				return callback(err);
			}
			callback(null,result);
		});

	});
};

module.exports.updateAppointments = function(date, time)
{

};

module.exports.cancelAppointment = function(appId)
{
	//Function
	var appointmentFind_promise = Appointment.findOne({_id:appId}).exec();
	//Flow Here
	appointmentFind_promise.then(function(appointment){
		appointment.status = 'canceled'
	});

};

module.exports.editAppointment = function(appInfo)
{
	var app = new Appointment(appInfo);
	app.update(function(err, data) {
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