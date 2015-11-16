'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var User = mongoose.model('User');

module.exports.addRoundWard = function (rwinfo,callback) {
 //Roundward Frontend need to pack field in the form correspond to 
 //schema's Attribute (name must be the same)
  var roundward_new = new Roundward(rwinfo);
 //Save into Database
  Roundward.save(function(err, roundward_new){
    if(!err){ 
    	callback(err,roundward_new);
    }else{
    	return callback(err); 
	}
  });
};

module.exports.cancelRoundward = function (doctorId_input,rwId_input,callback) {
  //Doctor Wants to CancelRoundward
  //Find Correspondent Doctor
  User.findOne({userid : doctorId_input},function(err1,thisDoctor){
  		if(!err1){
  			Roundward.findOne({rwId : rwId_input},function(err2,thisRoundward){
  				if(!err2){
  					// Delete Roundward From Doctor's Roundward Array List
  					//thisDoctor.availableRoundward.remove({rwid:rwId_input});
  					thisDoctor.availableRoundward.pull({rwid:thisRoundward._id},function(err3,result){
  						if(!err3){
  							return result;
  						}else{
  							console.log('cannot delete element from array');
  							callback(err3);
  						}
  					});  					
  				}else{
  					console.log('Cannot Find Roundward with rwId = '+rwId_input);
  					callback(err2);
  				}
  			});
  		}else{
  			console.log('Cannot Find Doctor with user_id = '+doctorId_input);
  			callback(err1);
  		}
  });
 
};

module.exports.getAvailableDateTime = function (doctorId_input,callback) {
	//Find Correspondent Doctor
	User.findOne({userid : doctorId_input},function(err,thisDoctor){
		if(!err){
			callback(err,res.json(thisDoctor.availableRoundward));			
		}else{
			console.log("No Doctor with user_id = " + doctorId_input);
			return callback(err);
		}
	});
  
};

module.exports.importRoundWard = function (longStream, callback) {
  //Read the CSVs and Put it into DATABASE
  var myObj = req.body.roundward;
  /*var temp = new Model({
  	'date' : req.body['date'],
  	'time' : req.body['time']
  });*/
	 myObj.split('\n');
	 for (var i = 0; i < myObj.length; i++) {
	 	var row = myobj[i].split(',');
	 	var temp = new Roundward(row);
	 	Roundward.save(temp, function(err,result){
	 		if(err){
	 			callback(err);
	 		}else{
	 			callback(err,result);
	 		}
	 	});
	 };
  
};

module.exports.showImportRoundWard = function (req, res, next) {
	//Before Render Query 
	//For Staff import Excel Tables
	//No Populate
	//Nothing Here :D 

};

module.exports.showAddRoundWard = function (doctorId_input,callback) {
  	//Before Render Query 
  	//For Doctor Create Appointment for his/her own patient
    
};