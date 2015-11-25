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
//DOCTOR USE UPDATEAPPOINTMENTS ( Chain from RoundwardControl . CancleRoundward)
module.exports.updateAppointments = function(department,rwid,callback)
{
	console.log(department);
	
	function findByIdAndPopulate(patient_id){
		//console.log(patient_id);
		return new Promise(
			function ( resolve , reject ){
				Patient.findById(patient_id).populate('userId','email')
				.exec().then(function(result){
					//console.log(result);
					resolve(result);
				});
			}
		);
	}

	var promise = Appointment.find({roundWard : rwid}).populate('roundWard').exec();
	promise.then(function(appointments){
		var patientList =[];
		appointments.forEach(function(e){

			e.status = 'canceled';
			e.save();
			var single_entry = { 'patient_id' : e.patient ,
								 'date' : e.roundWard.date };
			patientList.push(single_entry);	
		});
		return patientList;
	}).then(function populatePatientList(patient_list){
		var promises = [];
		for(var i = 0 ; i < patient_list.length ; ++i){
			console.log("PATIENT_ID = " + patient_list[i].patient_id );
			promises.push(
				findByIdAndPopulate(mongoose.Types.ObjectId(patient_list[i].patient_id))
			);
		}
		return Promise.all(promises);
			
	}).then(function afterGotEmail(){
		console.log(arguments);
		//FOR EVERYPATIENT get
		//GET DEPARTMENT FREETIME SLOT 0
		//CREATE APPOINTMENT FOR HIM 
		//LOOP
		console.log("GETFREEDEP in "+department);
		
	});
};

//PATIENT 
module.exports.cancelAppointment = function(appId,callback)
{
	console.log(appId);
	//Function
	var appointmentFind_promise = Appointment.findOne({_id:mongoose.Types.ObjectId(appId)}).exec();
	//Flow Here
	appointmentFind_promise.then(function(appointment){
		appointment.status = 'canceled'
		appointment.save();
		return appointment;
	}).then(function(appointment){
		console.log("NOTIFICATION HERE TO MAILER "+appointment)
	});
};

module.exports.editAppointment = function(userId,doctor_userId,callback)
{


	//Check Integrity of New Entry 
	Appointment.findOne(appInfo_new).exec()
	.then(function(existingAppointment){
		if(existingAppointment === null){
			return Appointment.findById(last_appId).exec(); //Find The Old One
		}
		return callback('existing Appointment');
	})
	.then(function(old_appointment){

	});
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