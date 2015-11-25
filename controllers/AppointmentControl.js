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
	var thisRoundward;
	var packed = {};

	//FIND THE ROUNDWARD FIRST 
	//var promise = Roundward.findOne({'date':appInfo.date , 'time': appInfo.time}).exec();
	var promise = Roundward.findOne({'date': {"$gte": new Date(appInfo.date.getFullYear(), appInfo.date.getMonth(), appInfo.date.getDate()), 
		"$lt": new Date(appInfo.date.getFullYear(), appInfo.date.getMonth(), appInfo.date.getDate() + 1)},
	 'time': appInfo.time}).exec();
	//{"created_on": {"$gte": new Date(2012, 7, 14), "$lt": new Date(2012, 7, 15)}}
	promise.then(function(roundward){
		console.log('finish getting roundward');
		if(roundward === null){
			//No Roundward = no doctor = no appointment can be made
			callback('no roundward');
			throw new Error('no roundward');
		}else{
		//Have Roundward
			thisRoundward = roundward;
			return Appointment.findOne({'roundWard' : roundward._id,'slot':appInfo.slot, 'status': 'confirmed'}).exec();
		}
	})
	.then(function(appointments){
		console.log('finish getting appointment');
		console.log(appointments);
		if(appointments === null){
			//EDITED
			return User.findOne({'_id':appInfo.doctor_id}).exec();
		}else{
			//There already have the appointment in the slot and roundward
			callback('no slot');
			throw new Error('no slot');
		}
	})
	.then(function(user){
		console.log(user);
		if(!user)
		{
			console.log('no user');
			callback('no user');
		}
		else
		{
			console.log('finding doctor');
			return Doctor.findOne({ 'userId': user._id }).exec();
		}
		
	})
	.then(function(thisDoctorFromDb){
		console.log('finish getting doctor');
		thisDoctor = thisDoctorFromDb;
		console.log(thisDoctor);
		packed.roundWard = thisRoundward._id;
		packed.doctor = thisDoctor._id;
		packed.slot = appInfo.slot;
		packed.status = appInfo.status;
		packed.causes = appInfo.causes;
		return Patient.findOne({userId:appInfo.patient_id}).exec();
	})
	.then(function(patient){
		packed.patient = patient._id;
		var appointment_input = new Appointment(packed);
		appointment_input.save(function(err,result){
			if(err){
				return callback(err);
			}
			console.log('Finish saving appointment');
			callback(null,result);
		});

	});
};

//When Remove Roundward 
//Appointments Which has roundWard = roundward._id 
//must be canceled
//DOCTOR USE UPDATEAPPOINTMENTS ( Chain from RoundwardControl . CancleRoundward)
module.exports.updateAppointments = function(department,rwid,callback){
	console.log("Update Appointment on Patient with Department = " + department);

	var patientList = [];
	//FUNCTIONS
	function findAppointmentById(roundwardId){
		return new Promise(
			function (resolve,reject){
				Appointment.find({roundWard : rwid})
				.populate({ path : 'roundWard' , select : 'date time'})
				.populate({ path : 'patient', select : 'userId'})
				.populate({ path : 'doctor' , select : 'userId'})
				.exec()
				.then(function(result){
					resolve(result);
				});
			}
		);
	}

	function populatedSingle(detail){
		return new Promise(function(resolve,reject){
			var options = {
				path : 'patient.userId' ,
				model : 'User',
				select : 'firstname lastname email'
			};
			Appointment.populate(detail,options,function(err,appointments){
				resolve(appointments);
			});	
		});
	}
	function populatedDoctor(detail){
		return new Promise(function(resolve,reject){
			var options = {
				path : 'doctor.userId' ,
				model : 'User',
				select : 'firstname lastname email'
			};
			Appointment.populate(detail,options,function(err,appointments){
				resolve(appointments);
			});	
		});
	}

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

	//FLOW GOES HERE
	findAppointmentById(rwid)
		.then(function havingAppointmentsInvolveThis_rwId(appointments){
			var promises = [];
			for (var i = 0 ; i < appointments.length ; ++i){
				appointments[i].status = 'canceled';
				appointments[i].save();
				promises.push(populatedSingle(appointments[i]));
			}
			return Promise.all(promises);
		}).then(function letPopulateDoctors(appointments){
			var objects = arguments;
			var promises = [];
			for (var i = 0 ; i < appointments.length ; ++i){
				promises.push(populatedDoctor(objects[i]));
			}
			return Promise.all(promises);
		}).then(function afterPopulation(patient_list){
			var myList = arguments;
			//Every Occurence
			for (var i = 0 ; i < myList.length ; ++i){
				console.log(myList[i]);
				//getAppointmentWithEarliestDatetime(department)
			}
			return callback(null,'success');
		});

}

module.exports.getAppointmentWithEarliestDatetime = function(department,callback){
	function findWholeMonth(department){
		return new Promise(
			function(resolve,reject){
				var date = new Date();
				RoundWardControl.getDepartmentFreeMonth(
					date.getFullYear(),
					date.getMonth(),
					department,
					function(err,result){
						resolve(result);
				});
		});
	}

	//FLOW GOES HERE
	findWholeMonth(department)
	.then(function gotWholeMonth(){
		var result = arguments;
		console.log(arguments);
	});

}


//PATIENT 
module.exports.cancelAppointment = function(appId,callback)
{
	/*console.log(appId);
	//Function
	var appointmentFind_promise = Appointment.findOne({_id:mongoose.Types.ObjectId(appId)}).exec();
	//Flow Here
	appointmentFind_promise.then(function(appointment){
		appointment.status = 'canceled';
		appointment.save();
		return appointment;
	}).then(function(appointment){
		console.log("NOTIFICATION HERE TO MAILER "+appointment);
	});*/

	Appointment.findOneAndUpdate({ '_id': appId}, { status: 'canceled' }, { new: true }, function(err, result)
	{
		if(err) { callback(err, null); }
		console.log("NOTIFICATION HERE TO MAILER "+result);
		callback(err, result);
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

module.exports.getAppointmentByPatientId = function(patientId, callback)
{
	Appointment.find({patient : patientId})
		.populate({ path : 'roundWard' , select : 'date time'})
		.populate({ path : 'doctor', populate: { path: 'userId', model: 'User', select: 'firstname lastname' } })
		.exec(callback);
};

module.exports.getAppointmentById = function(appId, callback)
{
	Appointment.findById(appId)
		.populate({ path : 'roundWard' , select : 'date time'})
		.populate({ path : 'doctor', populate: { path: 'userId', model: 'User', select: 'firstname lastname' } })
		.populate({ path : 'patient', populate: { path: 'userId', model: 'User', select: 'firstname lastname' } })
		.exec(callback);
};