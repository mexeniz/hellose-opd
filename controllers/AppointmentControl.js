'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var Appointment = mongoose.model('Appointment');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var RoundWardControl = require('./RoundWardControl.js');
var Patient = mongoose.model('Patient');


module.exports.createAppointment = function(appInfo, callback){
	// Guaranteed that input appinFo is valid
	/*appInfo
			-userId ( NO-firstname , NO-lastname ) //Doctor id is pass from frontend
			-patientid  //From  User's Session  (REQ.USER._ID)
			-slot // Slot to CreateAppointment - Valid and always Free 
			(only freeslot choice is shown , so input is freeslot)
			-status //{ok,canceled}
			-date time
	*/
	//Find Correspondent Doctor to add the Appointment with
	var thisDoctor;
	var packed = {};

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
			//EDITED
			return User.findOne({'_id':appInfo.userId}).exec().then(function(user){
				Doctor.findOne({userId:user._id}).exec();
			});
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

//When Remove Roundward 
//Appointments Which has roundWard = roundward._id 
//must be canceled
module.exports.updateAppointments = function(rwid,callback)
{
	var promise = Appointment.find({roundWard : rwid}).exec();

	promise.then(function(appointments){
		appointments.forEach(function(e){
			e.status = 'canceled';
			e.save();
		});
		/*
		NotificationControl.sendSMS();
		*/
	});
};

module.exports.cancelAppointment = function(appId,callback)
{
	console.log(appId);
	//Function
	var appointmentFind_promise = Appointment.findOne({_id:mongoose.Types.ObjectId(appId)}).exec();
	//Flow Here
	appointmentFind_promise.then(function(appointment){
		appointment.status = 'canceled'
		appointment.save();
	});
};

module.exports.editAppointment = function(appId_last,appInfo_new,callback)
{
	//Check Integrity of New Entry 
	Appointment
	//CancelAppointment Derm
	module.exports.cancelAppointment(appId)
	//Create New Appointment with Status " Pending "
};


module.exports.getAppointment = function(userId,month,year,callback){
	var returning = [];

	function findAppointment(userId){
    return new Promise(function(resolve,reject){
       Appointment.find({'userId' : userId}).populate('roundWard')
        .exec(function(err,result){
            if(err){
              reject(err);
            }
            resolve(result);
        });
    });
  	}
  	//FLOW
  	findAppointment(userId)
  	.then(function goFindAppointment(appointments){
  		appointments.forEach(function(appointment){
  			if(appointment.roundWard.date.getFullYear() === year 
  				&& appointment.roundWard.date.getMonth()+1===month ){
  				returning.push(appointment);
  			}
  		});
  			
  		
  	}).then(function finished(){
  		//console.log(returning);
  		callback(null,returning);
  	});

};