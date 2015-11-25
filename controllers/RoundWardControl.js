'use strict';

var mongoose = require('mongoose');
var Roundward = mongoose.model('Roundward');
var User = mongoose.model('User');
var Doctor = mongoose.model('Doctor');
var moment = require('moment');
var Appointment = mongoose.model('Appointment');
var AppointmentControl = require('./AppointmentControl.js');

/*
TEST CASE 
{
  //USE userId For Query Everything
    "date" : "2015-11-15",
    "time" : "AM",
    "doctorid(user._id)": "564a17045e402488288fc596"
    "doctor._id" : "564ec7d6324f8c3524d153f6",
}
*/
module.exports.addRoundWard = function(userId,rwinfo,callback) {
 //Roundward Frontend need to pack field in the form correspond to 
 //schema's Attribute (name must be the same)

 //Find Doctor to add the Roundward

  Doctor.findOne({userId:mongoose.Types.ObjectId(userId)},function(err,thisDoctor){
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
                callback(err4,result);
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
                callback(err4,res);
          });
            }
          });
        }
      });
    }
  });
};

module.exports.getRoundward = function(userId,month,year,callback){
  console.log("getting Roudward"+userId);
  var returning = [];

//FUNCTIONS

  function findDoctor(userId){
    return new Promise(function(resolve,reject){
        Doctor.findOne({'userId' : mongoose.Types.ObjectId(userId)})
        .populate('onDutyRoundward')
        .exec(function(err,result){
            if(err){
              reject(err);
            }
            resolve(result);
        });
    });
  }

//FLOW GOES HERE

  findDoctor(userId)
  .then(function afterFoundDoctor(doctor){
    doctor.onDutyRoundward.forEach(function(rw){
        if(rw.date.getMonth() === month && rw.date.getFullYear() === year){
        returning.push(rw);
      }
    });
  })
  .then(function() {
    console.log(returning);
    return callback(null,returning);
  });

};

module.exports.cancelRoundward = function (userId,rwId_input,callback) {
  //Doctor Wants to CancelRoundward
  //Find Correspondent Doctor
  Doctor.findOne({userId : userId},function(err1,thisDoctor){
  		if(!err1 && thisDoctor){
  			Roundward.findById(rwId_input,function(err2,thisRoundward){
  				if(!err2&&thisRoundward){
  					// Delete Roundward From Doctor's Roundward Array List
            Doctor.update({_id:thisDoctor._id},{$pull : {onDutyRoundward:thisRoundward._id}},
              {},
              function(err3,result){
                if(err3 || !result){
                  console.log('no doc found in order to update array');
                  return callback(err3);
                }else{
                  console.log("Update With Doctor Success");
                    //Appointment.findAndUpdate to Canceled
                    AppointmentControl.updateAppointment(thisRoundward._id,function(err5,app_result){
                      if(err5){
                        return callback(err5)
                      }
                      callback(null,result);
                    });
                        

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


module.exports.getAvailableDateTime = function(doctor_id,month,year,callback){
  console.log("getAvailableDateTime2 Called With "+year+"___"+month);
  var returning = [];
  var freeSlot = [];
  var busySlot = [];
  function findDoctorFromUsers(userId){
    return new Promise(
      function (resolve,reject){
          Doctor.findOne({'userId' : mongoose.Types.ObjectId(userId)})
          .populate({path : 'onDutyRoundward' , match: {date : {"$gte": new Date(year, month), "$lt": new Date(year, month+1)} }})
          .populate('userId' , 'firstname lastname')
          .exec(function(err,result){
              if(err)reject(err);
              resolve(result);
          });
    });
  }

  function findAppointment(e){ 
    return new Promise(function(resolve, reject){
        Appointment.find({roundWard : e._id }).populate('roundWard').exec(function(err,results){
          if(err){
              reject(err);
          }
          resolve(results);
        });
    });
  }

  var onDutyRoundwards;
  var thisDoctor_obj;
  //Flow Goes Here
  findDoctorFromUsers(doctor_id)
    .then(
      function havingDoctor(thisDoctor){
        thisDoctor_obj = thisDoctor.userId;
        return thisDoctor.onDutyRoundward;
    }).then(function(doctorRoundward){
      onDutyRoundwards = doctorRoundward;
      var promises = [];
      //EveryRoundward that thisDoctor hold
      for(var i  = 0; i < onDutyRoundwards.length;++i)
      {
            promises.push(findAppointment(onDutyRoundwards[i]));
      }
      
      return Promise.all(promises);
    }).then(function(){
      //We Got Appointments
        var appointments = arguments;
        onDutyRoundwards.forEach(function(e){
            var single_roundward = {
              date : e.date,
              firstname : thisDoctor_obj.firstname,
              lastname : thisDoctor_obj.lastname,
              time : e.time,
              doctor_id : thisDoctor_obj._id,
              roundward : e._id
            };
            var busySlot=[];
            var freeSlot=[];
            for(var i = 0 ; i < appointments.length ; ++i){
              for(var j = 0 ; j< appointments[i].length ; ++j){
                for(var k = 0 ; k < appointments[i][j].length ; ++k){
                    var data = appointments[i][j][k];
                    if(String(data.roundWard._id) === String(e._id)){
                        busySlot.push(data.slot);
                    }
                }
              }
            }
            for(var slot = 0 ; slot <15 ; ++slot){
              if(busySlot.indexOf(slot) === -1){
                    freeSlot.push(slot);
                  }
            }


            single_roundward.freeSlot = freeSlot;
            if(single_roundward.freeSlot.length > 0)
            {
              returning.push(single_roundward);
            }
        });
      return returning;
    }).then(function(){
      //SORTING 
      var comp = function (a,b){
            if(a.date.getFullYear() !== b.date.getFullYear())return a.date.getFullYear() < b.date.getFullYear()?-1:1;
            if(a.date.getMonth() !== b.date.getMonth())return a.date.getMonth() < b.date.getMonth()?-1:1;
            if(a.date.getDate() !== b.date.getDate())return a.date.getDate() < b.date.getDate()?-1:1;
            if(a.time !== b.time)return a.time === 'AM'?-1:1;
            return a.freeSlot[0] < b.freeSlot[0]?-1:1;
          };
      returning.sort(comp);
      console.log("DOCTOR"+doctor_id+ "= "+returning.length);
      return callback(null,returning);
      
    }); 
};


//Find Available time for single Doctor
module.exports.getAvailableDateTime2 = function (doctor_id,month,year,callback) {
	//Find Correspondent Doctor
  var roundward_return = [];
  var roundward = [];
	Doctor.findOne({'userId' : mongoose.Types.ObjectId(doctor_id)})
  .populate('onDutyRoundward')
  .then(function(result){
    console.log(result);
    result.onDutyRoundward.forEach(function(e,index){
      var daypack = {
        day : e.date.getDate() ,
        month :  e.date.getMonth()+1 ,
        year : e.date.getFullYear(),
      };
      console.log(daypack.month +"___"+month);
      console.log(daypack.year +"___"+year);
      //Specific Month
      //with the roundward of that doctor_id
      if(month===daypack.month && year === daypack.year){
        var busySlot = [];
        var freeSlot_query = [];
          Appointment.find({roundWard : e._id })
          .then(function(appointment){
                appointment.forEach(function(app){
                  busySlot.push(app.slot);
                });
              
              //console.log(busySlot);
              for(var a = 0 ; a < 15 ; a++){
                  if(busySlot.indexOf(a) === -1){
                    freeSlot_query.push(a);
                  }
              }
              if(freeSlot_query.length > 0 /*&& (new Date(daypack.year,daypack.month,daypack.day) >= new Date())*/){
                //PACKED DATA HERE 
                var single_roundward = {
                  date : daypack,
                  time : e.time, //AMPM
                  freeSlot : freeSlot_query,
                  doctorid : doctor_id
                };
                //console.log(single_roundward);
                roundward_return.push(single_roundward);
              }
        }).then(function(){
          roundward = roundward_return;
          var comp = function (a,b){
            if(a.date.year !== b.date.year)return a.date.year < b.date.year?-1:1;
            if(a.date.month !== b.date.month)return a.date.month < b.date.month?-1:1;
            if(a.date.day !== b.date.day)return a.date.day < b.date.day?-1:1;
            if(a.time !== b.time)return a.time === 'AM'?-1:1;
            return a.freeSlot[0] < b.freeSlot[0]?-1:1;
          };
          roundward.sort(comp);
          return callback(null,roundward);
        });
      }
        console.log(roundward_return.length);
      
    });
  });
};

module.exports.getDepartmentFreeMonth = function(month,year,department,callback){

  function findDoctor(department) {
    return new Promise(
      function (resolve, reject) {
        Doctor.find({'department': department}, 
          function (err,doctors) {
            if(err)reject(err);
            resolve(doctors);
          });
      });
  }

  function getAvailTime(doctor, month,year) {
    return new Promise(
      function (resolve, reject) {
        module.exports.getAvailableDateTime(doctor.userId, month, year,
          function (err, result) {
            resolve(result);
          });
      });
  }

  var returning = [];

  findDoctor(department)
    .then(
      function havingDoctors(doctors) {
        var promises = [];
        for (var i = 0; i < doctors.length; ++i) {
          console.log(i);
          promises.push(
            getAvailTime(doctors[i], month,year) );
        }
        return Promise.all(promises);
      })
    .then(
      function havingTimes(doctors) {
        var doctorAvailableTimes = arguments;
        for (var i = 0; i < doctorAvailableTimes.length; ++i) {
          var doctorTimes = doctorAvailableTimes[i];
          // returning.push(doctorTimes);
          for(var j = 0;j < doctorTimes.length; ++j){
            returning = returning.concat(doctorTimes[j]);
          }
        }
      })
    .then(

      function finished() {
        var comp = function (a,b){
            if(a.date.getFullYear() !== b.date.getFullYear())return a.date.getFullYear() < b.date.getFullYear()?-1:1;
            if(a.date.getMonth() !== b.date.getMonth())return a.date.getMonth() < b.date.getMonth()?-1:1;
            if(a.date.getDate() !== b.date.getDate())return a.date.getDate() < b.date.getDate()?-1:1;
            if(a.time !== b.time)return a.time === 'AM'?-1:1;
            if(a.freeSlot[0] !== b.freeSlot[0])return a.freeSlot[0] < b.freeSlot[0]?-1:1;
            return Math.random() < 0.5?-1:1;
          };
          returning.sort(comp);
        return callback(null,returning);
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
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        pack = {};
                    }
                    if(e.sun2 == '1'){
                        //console.log('sunday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 1:     
                    if(e.mon1 === '1'){
                        //console.log('monday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.mon2 === '1'){
                        //console.log('monday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 2:
                    if(e.tue1 == '1'){
                        //console.log('tuesday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.tue2 == '1'){
                        //console.log('tuesday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 3:
                    if(e.wed1 == '1'){
                       // console.log('wednesday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.wed2 == '1'){
                       // console.log('wednesday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 4:
                    if(e.thr1 == '1'){
                       // console.log('thursday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.thr2 == '1'){
                       // console.log('thursday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                   
                    break;
                case 5:
                    if(e.fri1 == '1'){
                        //console.log('friday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.fri2 == '1'){
                       // console.log('friday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    break;
                case 6:
                    if(e.sat1 == '1'){
                       // console.log('saturday morning '+m.date());
                        pack.time = 'AM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
                        my_stack.push(pack); pack = {};
                        
                    }
                    if(e.sat2 == '1'){
                       // console.log('saturday afternoon '+m.date());
                        pack.time = 'PM';
                        pack.date = m.format('YYYY-MM-DD').hour(1); 
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

