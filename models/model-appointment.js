'use strict';
/**
Model : Appointment
Platform : MongoDB
Framework : MongooseJS
*/

//Mongoose Included
var mongoose = require('mongoose'),
//Bind Schema
Schema = mongoose.Schema;

//Create Appointment Schema
var AppointmentSchema = new Schema({
	
});

module.exports = mongoose.model('Appointment', AppointmentSchema);