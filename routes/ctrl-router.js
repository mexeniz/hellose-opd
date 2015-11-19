'use strict';

/*
Router reference 
router.METHOD(path, callback [, callback ...])
*/ 

//Include express engine
var express =require('express');
//Create the router for this controller file
var router = express.Router();
module.exports = router;

// //Model Defining
// var mongoose = require('mongoose');
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
	res.render('appointment/index');
});
router.get('/create', function(req,res){
	//Callback function on get finished
	//Render Appointment Creation View
	res.render('appointment/createAppointment');
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

	RoundWardControl.addRoundward(req.body,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}	
	});	
});
router.post('/cancelRoundward', function(req,res,next){
	var doctor_id = req.body.userid;
	var roundward_id = req.body.rwID;
	RoundWardControl.cancelRoundward(doctor_id,roundward_id,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
	
});
router.post('/getAvailableDateTime', function(req,res,next){
	var doctor_id = req.body.userid;
	RoundWardControl.getAvailableDateTime(doctor_id,function(err,result) {
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
});
router.get('/importRoundward', function(req,res,next){
	//Use This Place (Router) to Split File
	var longStream = req.body;
	RoundWardControl.importRoundward(longStream,function(err,result){
		if(err){
			return next(err);
		}else{
			return res.json(result);
		}
	});
	//Render Here
	
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





































































////////////////////////////////////////////

// //POST Function To Create New Entry
// router.post('/insert',function(req,res,next){
// 	//Since Everything in appointment are packed in req.body
// 	var appointment = new Appointment(req.body);
// 	//Save Things in to Database via mongoose api
// 	Appointment.save(function(err, appointment) {
// 		//onError do nothing and return error msg 
// 		if(err){
// 			return next(err);
// 		}
// 		//onSuccess Return itself in json packed formatted
// 		res.json(appointment);
// 	});

// });

// //GET Function to fetch All list  
// router.get('/getAll',function(req,res,next) {
// 	//Populate Everything
// 	Appointment.find(function(err,appointment){
// 		if(err){
// 			return next(err);
// 		}
	
// 	});


// });