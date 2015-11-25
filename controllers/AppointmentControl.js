'use strict';
var async = require('async'); 
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
	//console.log(appInfo.rwId);
	//FIND THE ROUNDWARD FIRST 
	
		//Create Promise with Date and Time Finding for Roundward	
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
			return Appointment.findOne({'roundWard' : roundward._id,'slot':appInfo.slot}).exec();
		}
	})
	.then(function(appointments){
		console.log('finish getting appointment');
		console.log(appointments);
		if(appointments === null || appointments.status === 'canceled'){
			//EDITED
			return User.findOne({'_id':appInfo.doctor_id}).exec();
		}else{
			//There already have the appointment in the slot and roundward
			return callback('no slot');
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



module.exports.createAppointment2 = function(appInfo, callback){
	console.log("create app 2 called");
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
	//Create Promise with ROUNDWARD _ID Finding
		console.log('createAppointment2  with rwID (from Earliest and UpdateApp and CancelRound');
		var promise = Roundward.findById(appInfo.rwId).exec(); 

	promise.then(function(roundward){
		console.log('finish getting roundward');
		if(roundward === null ){
			//No Roundward = no doctor = no appointment can be made
			callback('no roundward');
			throw new Error('no roundward');
		}else{
		//Have Roundward
			thisRoundward = roundward;
			return Appointment.findOne({'roundWard' : roundward._id,'slot':appInfo.slot}).exec();
		}
	})
	.then(function(appointments){
		
		if(appointments === null){
			//EDITED
			return User.findOne({'_id':appInfo.doctor_id}).exec();
		}else{
			//There already have the appointment in the slot and roundward
			return callback('no slot');
			// throw new Error('no slot');
		}
	})
	.then(function(user){

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
		//console.log(thisDoctor);
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
			console.log(result);
			callback(null,result);
		});

	});
};

//FOR CANCELROUNDWARD AND UPDATEAPPOINTMENT
module.exports.createAppointmentWithEarliestDatetime = function(cause,patientId,department,callback){
	console.log('LET GET CREATE===================================');
	function findWholeMonth(department){
		return new Promise(
			function(resolve,reject){
				var date = new Date();
				RoundWardControl.getDepartmentFreeMonth(
					date.getMonth(),
					date.getFullYear(),
					department,
					function(err,result){
						resolve(result);
				});
		});
	}
	function createAppointment(appinfo){
		return new Promise(
			function(resolve,reject){
				module.exports.createAppointment2(appinfo,function(err,result){
					resolve(result);
				});
			}
		);
	}
	function createAppointment2(appinfo){
		module.exports.createAppointment2(appinfo,function(err,result){
			return result;
		});
	}

	//FLOW GOES HERE
	findWholeMonth(department)
	.then(function gotWholeMonth(result){
		if(result.length >0){
		var earliestAppointment = result[0];
		console.log("mY EARLIEST = ");
		console.log(earliestAppointment);
			//create Appointment based on result[0]
			 var appInfo = {
			    doctor_id : mongoose.Types.ObjectId(earliestAppointment.doctor_id),
			    patient_id : mongoose.Types.ObjectId(patientId), 
			    rwId : mongoose.Types.ObjectId(earliestAppointment.roundward),
			    slot : earliestAppointment.freeSlot[0],
			    status : 'suggested',
			    causes : cause
			  };
			var promises = [];
			//console.log(appInfo);
			promises.push(createAppointment(appInfo));
			return Promise.all(promises);
		}else{
			console.log("NO ROUNDWARD CAN BE SELECTED T_T FOR EARLIEST APPOINTMENT");
			return;
		}
	}).then(function(){
		var result = arguments;
		console.log("FINISHED");
		return callback(null,"SUCCESS");
	});

}

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

	function createAppointment_earliest(cause,patient_id,department){
		console.log('creating earlise for '+ patient_id);
		return new Promise(
			function(resolve,reject){
				module.exports.createAppointmentWithEarliestDatetime(cause,patient_id,department,function(err,result){
					resolve(result);
				});
			}
		);	
	}


	//FLOW GOES HERE
	findAppointmentById(rwid)
		.then(function havingAppointmentsInvolveThis_rwId(appointments){
			console.log('in have');
			var promises = [];
			for (var i = 0 ; i < appointments.length ; ++i){
				appointments[i].status = 'canceled';
				appointments[i].save();
				promises.push(populatedSingle(appointments[i]));
			}
			return Promise.all(promises);
		}).then(function letPopulateDoctors(appointments){
			console.log('in let');
			var objects = arguments;
			var promises = [];
			for (var i = 0 ; i < appointments.length ; ++i){
				promises.push(populatedDoctor(objects[i]));
			}
			return Promise.all(promises);
		}).then(function afterPopulation(patient_list){
			console.log('in after');
			var myList = arguments[0][0];
			var promises = [];
			//console.log(myList);

			for (var i = 0 ; i < myList.length ; ++i){
				console.log('=============='+ i+'==================');
				// console.log(i);
				console.log("CAUSES : "+myList[i].causes);
				console.log("USER_ID : "+myList[i].patient.userId._id);
				
				

				promises.push(createAppointment_earliest(myList[i].causes,myList[i].patient.userId._id,department));
			}
			
			/*async.series(promises,function(err,result){
				module.exports.createAppointmentWithEarliestDatetime(cause,patient_id,department,function(err,result){
					resolve(result);
				});
			});*/
			Promise.all(promises);
		});
			


		/*.then(function afterPopulation(patient_list){
			console.log('in after');
			var myList = arguments[0][0];
			var promises = [];
			//Every Occurence
			
			for (var i = 0 ; i < myList.length ; ++i){
				console.log('=============='+ i+'==================');
				// console.log(i);
				console.log("CAUSES : "+myList[i].causes);
				console.log("USER_ID : "+myList[i].patient.userId._id);

				 promises.push(
				 	createAppointment_earliest(myList[i].causes,myList[i].patient.userId._id,department)
				 );
			}
			
		}).then(function receive(){
			console.log("MY HOPE HERE");
			var successApp = arguments;
			callback(null,successApp);
		});*/

}





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

module.exports.getAppointmentByPatientId = function(patientId, callback)
{
	Appointment.find({patient : patientId})
		.populate({ path : 'roundWard' , select : 'date time'})
		.populate({ path : 'doctor', populate: { path: 'userId', model: 'User', select: 'firstname lastname' } })
		.exec(callback);
};