'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');

/*
TEST CASE 
{
    "date" : "2015-11-15",
    "time" : "AM",
    "doctorid": "564a17045e402488288fc596"
}

*/
module.exports.addRoundWard = function(doctorid,rwinfo,callback) {
 //Roundward Frontend need to pack field in the form correspond to 
 //schema's Attribute (name must be the same)

 //Find Doctor to add the Roundward
  Doctor.findOne({userId:doctorid},function(err,thisDoctor){
    if(err || !thisDoctor){ 
      return callback(err,'NO DOC FOUND');
    }else{ 
      //Found Doctor
      var roundward_entity = new Roundward(rwinfo);  //Create Roundward 
      Roundward.findOne({date:roundward_entity.date,time:roundward_entity.time},
        function(err2,result){
        if(err2){
          return callback(err2);
        }else if(result){
          //Already Exist ! : Add To Array
          Doctor.findByIdAndUpdate(
                    thisDoctor._id,
                    { $addToSet: {"availableRoundward": result._id}},
                    {  safe: true, upsert: true},
             function(err4, model) {
               if(err){
                return callback(err4);
               }
                callback(err4,thisDoctor);
          });
        }else if(!result){
          //New Roundward ! : Add To Array
          roundward_entity.save(function(err3,res){
            if(err3){
              return callback(err3);
            }else{
              //Add To Array
              Doctor.findByIdAndUpdate(
                    thisDoctor._id,
                    { $addToSet: {"availableRoundward": res._id}},
                    {  safe: true, upsert: true},
             function(err4, model) {
               if(err){
                return callback(err4);
               }
                callback(err4,thisDoctor);
          });
            }
          });
        }
      });
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