'use strict';

/*
Router reference 
router.METHOD(path, callback [, callback ...])
*/ 

//Include express engine
var express =require('express');
//inlucde momentjs 
var moment = require('moment');
//Create the router for this controller file
var router = express.Router();
module.exports = router;
var Promise = require('promise');

// //Model Defining
var mongoose = require('mongoose');
// var Appointment = mongoose.model('Appointment');

////////////////////////////////////////////
//Class Required
////////////////////////////////////////////
var UserControl = require('../controllers/UserControl.js');
var RoundWardControl = require('../controllers/RoundWardControl.js');
var NotificationControl = require('../controllers/NotificationControl.js');
var AppointmentControl = require('../controllers/AppointmentControl.js');


////////////////////////////////////////////
//PAGE REQUEST under URL = '/appointment'
////////////////////////////////////////////

router.get('/', function(req,res){ //Default Route
	//Callback function on get finished
	//Render index.ejs
	console.log(req.user);
	res.render('appointment/index');
});
router.get('/create', function(req,res){
	//Callback function on get finished
	//Render Appointment Creation View
	res.render('appointment/createAppointment');
});

router.get('/import', function(req,res){
	//Callback function on get finished
	//Render Appointment Creation View
	res.render('appointment/import_schedule');
});

router.get('/patientView', function(req,res){
	//Callback function on get finished
	//Render Appointment Creation View
	res.render('appointment/patientViewAppointment');
});

////////////////////////////////////////////
// RoundwardControl Funtion Rounting 
////////////////////////////////////////////

router.post('/addRoundward', function(req,res,next){
	var roundward = {date:req.body['date'],
				time:req.body['time']};
	var userId = '564d48fab16f9a802283f450'; //GetFromSession
	RoundWardControl.addRoundWard(userId,roundward,function(err,result){
		if(err){
			return next(err); 
		}
		return res.json(result);
	});
});
router.post('/cancelRoundward', function(req,res,next){
	var userId = '564d48fab16f9a802283f450'; //GetFromSession
	var roundward_id = mongoose.Types.ObjectId(req.body['rwId']);
	RoundWardControl.cancelRoundward(userId,roundward_id,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
});

//Fetch Single Doctor whom Available that month  
router.post('/getAvailableDateTime', function(req,res,next){
	var doctor_id = req.body['doctor_id'];
	var month = req.body['month'];
	var year = req.body['year'];
	RoundWardControl.getAvailableDateTime(doctor_id,month,year,function(err,result) {
		if(err){
			return next(err);
		}else{
			var returning = {
				'doctor_id' : doctor_id,
				'month' : month,
				'data': result
			};
			return res.json(returning);
		}
	});
});



router.post('/getDepartmentFreeMonth',function(req,res,next){
	//Query Free Slot in a Month with Every Doctor in that Department
	var month = req.body['month'];
	var department = req.body['department'];
	var year = req.body['year'];
	RoundWardControl.getDepartmentFreeMonth(month,year,department,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
});

router.post('/getRoundward',function(req,res,next){
	var month = req.body['month'];
	var year = req.body['year'];
	//FIX ME
	RoundWardControl.getRoundward('564d48fab16f9a802283f450',month,year,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});

});


router.post('/importRoundward', function(req,res,next){
	//Use This Place (Router) to Split File
	var longStream = req.body;
	var startDate = new Date(longStream.year,longStream.month);
	RoundWardControl.importRoundWard(startDate,longStream.data,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
});
router.get('/showImportRoundWard/', function(req,res,next){
	//Default Call => Return Months.Now
	//RoundWardControl.showImportRoundWard(req);
	res.render('appointment/import_schedule');
});

router.get('/showAddRoundWard/', function(req,res,next){
	//Default Call => Return Months.Now
	var doctor_id = req.body.userid;
	RoundWardControl.showAddRoundWard(doctor_id,function(err,result){

	});
});

router.post('/gen/', function(req,res,next){
	console.log("test");
	AppointmentControl.generate();
});
router.post('/chooseDate/', function(req,res,next){
	//Default Call => Return Months.Now
	//RoundWardControl.showImportRoundWard(req);
	res.render('appointment/chooseDate' , data);
});
router.get('/chooseDate/', function(req,res,next){
	//Default Call => Return Months.Now
	//RoundWardControl.showImportRoundWard(req);
	var data = [1,2,3,4] ;
	res.render('appointment/chooseDate' , data);
});


////////////////////////////////////////////
// AppointmentControl Funtion Rounting 
////////////////////////////////////////////

router.post('/createAppointment/',function(req,res,next){
	var appInfo = {
		//firstname : req.body['docfirstname'],
		//lastname : req.body['doclastname'],
		doctor_id : mongoose.Types.ObjectId(req.body['doctor_id']),
		patientid : 12345678, 
		date : req.body['date'],
		time : req.body['time'],
		slot : req.body['slot'],
		status : req.body['status']
	};

	AppointmentControl.createAppointment(appInfo,function(err,result){
		if(err){
			return next(err);
		}else{
			console.log('success');
		}
	});
});

router.post('/getEarliestDateTime/',function (req,res,next) {

	var user_doctor = {
		//firstname : req.body['docfirstname'],
		//lastname : req.body['doclastname']
		"id" : req.body['doctor_id']
	};
	AppointmentControl.getEarliestDateTime(user_doctor,req.body['amount'],function(err,result) {
		if(err){
			console.log(err);
			//return next(err);
		} else if ( !err  && result ){
			console.log('SUCCESS');
			return res.json('success');
		}
	});
});


router.post('/getEarliestDateTime/',function (req,res,next) {

	var user_doctor = {
		//firstname : req.body['docfirstname'],
		//lastname : req.body['doclastname']
		"id" : req.body['doctor_id']
	};
	AppointmentControl.getEarliestDateTime(user_doctor,req.body['amount'],function(err,result) {
		if(err){
			console.log(err);
			//return next(err);
		} else if ( !err  && result ){
			console.log('SUCCESS');
			return res.json('success');
		}
	});
});
