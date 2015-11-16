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
	date: {type:Date, index: {unique: true, dropDups: true}}, //Date YYYY-MM-DD
	time: {type:'String'} //Morning or Afternoon

});

module.exports = mongoose.model('Roundward', RoundwardSchema);