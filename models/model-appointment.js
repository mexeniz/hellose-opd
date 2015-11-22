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
	patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
	doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
	roundWard: { type: mongoose.Schema.Types.ObjectId, ref: 'Roundward' },
	slot: Number,
	status: String
});

module.exports = mongoose.model('Appointment', AppointmentSchema);