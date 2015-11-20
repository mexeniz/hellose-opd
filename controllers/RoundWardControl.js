'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var moment = require('moment');

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
                    { $addToSet: {"onDutyRoundward": result._id}},
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
                    { $addToSet: {"onDutyRoundward": res._id}},
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
  Doctor.findOne({userId : doctorId_input},function(err1,thisDoctor){
  		if(!err1 && thisDoctor){
  			Roundward.findById(rwId_input,function(err2,thisRoundward){
  				if(!err2&&thisRoundward){
  					// Delete Roundward From Doctor's Roundward Array List
            Doctor.update({_id:thisDoctor._id},{$pull : {availableRoundward:thisRoundward._id}},
              {},
              function(err3,result){
                if(err3 || !result){
                  console.log('no doc found in order to update array');
                  return callback(err3);
                }else{
                  callback(err3,thisDoctor);
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
	Doctor.findOne({userId : doctorId_input})
  .populate('availableRoundward').exec(function(err,result){
    if(err){
      return callback(err);
    }
    callback(err,result.availableRoundward);
  });  
};

module.exports.importRoundWard = function (startDate,data,callback) {
  //Read the CSVs and Put it into DATABASE
  var beginningMonth = startDate;
  var endMonth = new Date(startDate.getFullYear(),startDate.getMonth()+1,0);
data.forEach(function(e){
  var my_stack = [];
      User.findOne({firstname:e.docfirstname,lastname:e.doclastname},function(err,thisDoctor){
        if(err){
          return callback(err);
        }else if(!thisDoctor){
            console.log(' NO Doctor Found');
        }else if(thisDoctor && !err){
            //Script Goes Here
          var a = moment(beginningMonth);
          var b = moment(endMonth);
          for (var m = a; m.isBefore(b); m.add(1,'days')) {
            var pack= {};
            switch(m.day()) {
                case 0:         
                    if(e.sun1 == '1'){
                        //console.log('sunday morning'+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        pack = {};
                    }
                    if(e.sun2 == '1'){
                        //console.log('sunday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 1:     
                    if(e.mon1 === '1'){
                        //console.log('monday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.mon2 === '1'){
                        //console.log('monday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 2:
                    if(e.tue1 == '1'){
                        //console.log('tuesday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.tue2 == '1'){
                        //console.log('tuesday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 3:
                    if(e.wed1 == '1'){
                       // console.log('wednesday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.wed2 == '1'){
                       // console.log('wednesday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 4:
                    if(e.thr1 == '1'){
                       // console.log('thursday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.thr2 == '1'){
                       // console.log('thursday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                   
                    break;
                case 5:
                    if(e.fri1 == '1'){
                        //console.log('friday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.fri2 == '1'){
                       // console.log('friday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 6:
                    if(e.sat1 == '1'){
                       // console.log('saturday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.sat2 == '1'){
                       // console.log('saturday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD'); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                default:
                    console.log('m.day Error');
            }
          }
           console.log(my_stack);
           my_stack.forEach(function(e){
              module.exports.addRoundWard(thisDoctor._id,e,function(){
                //Nothing
              });
           });
        }
      }).exec(function(){
        console.log('Roundward entry added : '+ my_stack.length);
        console.log('Endloop');
      });
  });
  
  
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