'use strict';

/**
Router reference 
router.METHOD(path, callback [, callback ...])
*/ 

//Include express engine
var express =require('express');
//Create the router for this controller file
var router = express.Router();
module.exports = router;

//Model Defining
var mongoose = require('mongoose');
var Appointment = mongoose.model('Appointment');

//Get Request on the root of this controller
router.get('/', function(req,res){
	//Callback function on get finished
	//Render index.ejs
	res.render('appointment/index');
});


