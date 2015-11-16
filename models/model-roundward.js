'use strict';
/**
Model : Roundward
Platform : MongoDB
Framework : MongooseJS
*/

//Mongoose Included
var mongoose = require('mongoose'),
//Bind Schema
Schema = mongoose.Schema;

//Create Appointment Schema
var RoundwardSchema = new Schema({
	date: {type:Date}, //Date YYYY-MM-DD
	time: {type:'String'} //Morning or Afternoon

});

//[Trick]Drop Collection First When Composite Index(date,time) does not effect
RoundwardSchema.index({ date: 1, time: 1}, { unique: true });

module.exports = mongoose.model('Roundward', RoundwardSchema);