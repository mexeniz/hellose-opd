'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Patient = mongoose.model('Patient');
var Doctor = mongoose.model('Doctor');
var Department = mongoose.model('Department');
var async = require('async');

module.exports.login = function(req, username, password, done) { 
	// check in mongo if a user with username exists or not
	var role = req.body.role;
	var query = {};
	query.username = username;
	switch(role)
	{
		case '1':
			query.isPatient = true;
			break;
		case '2':
			query.isDoctor = true;
			break;
		case '3':
			query.isStaff = true;
			break;
		case '4':
			query.isPharmacist = true;
			break;
		case '5':
			query.isNurse = true;
			break;
		case '6':
			query.isAdmin = true;
	}

	/*
	User.findOne(query, 
		function(err, user) {
			// In case of any error, return using the done method
			if(!user)
			{
				return done(null, false, req.flash('message', 'User not found'));

			}
			else
			{
				// Check password
				if(!user.validPassword(password))
				{
					console.log('Invalid Password');
					return done(null, false, req.flash('message', 'Invalid Password'));
				}
				
				// User and password both match, return user from 
				// done method which will be treated like success
				//user.aa = "aa";
				//console.log(user);

				// Set role
				req.session.role = role;
				return done(null, user, req.flash('message', role));
			}
			
		}
	);*/

	User.findOne(query)
	.then(
		function(user){
		if(!user)
		{
			console.log('User not found');
			return done(null, false, req.flash('message', 'User not found'));
		}
		// Check password
		if(!user.validPassword(password))
		{
			console.log('Invalid Password');
			return done(null, false, req.flash('message', 'Invalid Password'));
		}
		
		// User and password both match, return user from 
		// done method which will be treated like success
		// Set role
		req.session.role = role;
		console.log("ROLE IS"+role);
		if(role === '1')
		{
			Patient.findOne({ userId: user._id }, function(err, patient)
			{
				if(err || !patient) {
					return done(null, false, req.flash('message', 'Not found patient data'));
				}
				req.session.patient_id = patient._id;
				console.log(req.session.patient_id);
				return done(null, user, req.flash('message', role));
			});
		}
		else if(role === '2')
		{
			console.log(user._id);
			Doctor.findOne({ userId: user._id }, function(err, doctor)
			{
				console.log(doctor);
				if(err || !doctor) {
					return done(null, false, req.flash('message', 'Not found doctor data'));
				}
				req.session.doctor_id = doctor._id;
				console.log(req.session.doctor_id);
				return done(null, user, req.flash('message', role));
			});
		}
		else
		{
			return done(null, user, req.flash('message', role));
		}	
	});
	/*.catch(function(err){
		return done(null, false, req.flash('message', 'Something wrong!'));
	});*/

};

module.exports.listUser = function(done) {
	var result = [];
	User.find().populate('doctor').exec(function(err, users) {
		async.forEach(users, function(user, done) {
			Doctor.findOne().where('userId').in([user.id]).exec(function(err, doctor) {
				var item = {};
				item.id = user._id;
				item.username = user.username;
				item.isPatient = user.isPatient;
				item.isDoctor = user.isDoctor;
				item.isStaff = user.isStaff;
				item.isPharmacist = user.isPharmacist;
				item.isNurse = user.isNurse;
				if(doctor) {
					var query = doctor.department;
					item.department_id = query;
					Department.findOne({ _id: query}, function(err, department) {
						item.department = department.name;
						result.push(item);
						done(err);
					});
				} else {
					result.push(item);
					done(err);
				}
				//item.department = doctor.department;
				//result.push(item);
				//console.log(item);
				//done(err);
			});
		}, function(err) {
			return done(null, result);
		});
	});
};

module.exports.updateUser = function(userid, role, done) {
	var query = {};
	query._id = userid;
	// Find that user 
	console.log(userid);
	console.log(role);
	User.findOne(query, function(err, user) {
		console.log(user);
		if (err) {
			return done(null, false);
		}
		console.log('findOne');
		if (user) {
			user.isPatient = role.isPatient;
			user.isDoctor = role.isDoctor;
			user.isStaff = role.isStaff;
			user.isPharmacist = role.isPharmacist;
			user.isNurse = role.isNurse;
			console.log(user);
			user.save(function (err) {
				if (err) {
					return done(null,false);
				} else {
					if (user.isDoctor) {
						Doctor.findOne({ userId: userid}, function(err, doctor) {
							if (doctor) {
								doctor.department = role.department;
								doctor.save(function(err) {
									if(err) {
										done(err);
									} else {
										done(err);
									}
								});
							} else {
								var item = new Doctor({ userId: userid, department: role.department });
								item.save(function (err, item) {
								if (err) {
								  	done(err);
								  }
								  
								  if(item) {
								  	done(err);
								  }
								});
							}
						});
					} else {
						Doctor.findOne({ userId: userid}, function(err, doctor) {
							if (doctor) {
								Doctor.remove({ userId: userid}, function(err) {
								    if (err) {
								        done(err);
								    }
								    else {
								        done(err);
								    }
								});
							} else {
								done(err);
							}
						});
					}
					return done(null,user);
				}
			});
		}
	});
};

module.exports.deleteUser = function(userid, done) {
	// Check if that user is a doctor
	Doctor.findOne({ userId: userid}, function(err, doctor) {
		if(err) {
			done(null, false);
		}
		// If they are doctor remove doctor info
		if(doctor) {
			Doctor.remove({ userId: userid}, function(err) {
				if(err) {
					return done(null,false);
				} else {
					// Then remove user info
					User.remove({ _id: userid}, function(err) {
						if(err) {
							return done(null,false);
						} else {
							// Then remove patient info
							Patient.remove({ userId: userid}, function(err) {
								if (err) {
									return done(null, false);
								} else {
									return done(null, true);
								}
							});
						}
					});
				}
			});
		} else {
			// Remove user info
			User.remove({ _id: userid}, function(err) {
				if(err) {
					return done(null,false);
				} else {
					// Remove patient info
					Patient.remove({ userId: userid} ,function(err) {
						if (err) {
							return done(null, false);
						} else {
							return done(null, true);
						}
					});
				}
			});
		}
	});
}

module.exports.register = function(req, username, password, done) {
	var ssn = req.body.ssn;

    var findOrCreateUser = function(){
      // find a user in Mongo with provided username or ssn
      User.find(function(err,userList){
      	  var n = userList.length ;
		  User.findOne({ $or:[ { 'username': username }, { 'ssn': ssn }, { 'email': req.body.email } ] }, function(err, user) {
		    // In case of any error return
		    if (err){
		      console.log('Error in SignUp: '+err);
		      return done(err);
		    }
		    // already exists
		    if (user) {

				// Check if old patient
				Patient.findOne( { 'userId': user._id }, function(err, patient) {
					// Found patient data
					if(patient)
					{
						return done(null, false, 
				 		req.flash('message', 'มีผู้ใช้บัญชีนี้แล้ว'));
					}
					else // Not found patient data
					{
						// create patient data
			            var newPatient = new Patient();
			            newPatient.userId = newUser;

			            // Get next patient id
			            var pat_id = n + '';
			            var size = 8;
		    			while (pat_id.length < size) {
		    				pat_id = '0' + pat_id;
		    			}

			            newPatient.patient_id = pat_id;
			            newPatient.blood_type = req.body.blood_type;
					    newPatient.save(function(err) {
					    	if (err){
					          console.log('Error in Saving patient: '+err);  
					          req.flash('message','Error in Saving patient: '+err);
					        }
					    	console.log('User Registration successful');    
					    	// Set role as patient
							req.session.role = '1';
					    	return done(null, newUser);
					    });
					}
				});

		    } else {
		      // if there is no user data
		      // create the user
		      var newUser = new User();
		      // set the user's local credentials
		      newUser.username = username;
		      newUser.setPassword(password);
				newUser.gender = req.body.gender;
				newUser.birthdate = req.body.birthdate;
				newUser.ssn = req.body.ssn;
				newUser.firstname = req.body.firstname;
				newUser.lastname = req.body.lastname;
				newUser.telNum = req.body.telNum;
				newUser.address = req.body.address;
				newUser.email = req.body.email;
				newUser.isPatient = true;

		      	// save the user
		      	newUser.save(function(err) {
		        if (err){
		          console.log('Error in Saving user: '+err);  
		          return done(null, false, req.flash('message', 'Error in Saving user: '+err));
		        }

		        // Count all patient number
		        Patient.count({}, function(err, n) {
		        	if(err) {
		        		console.log('Error in Saving user: '+err);  
		          		req.flash('message','Error in Saving user: '+err);
		        	}

		        	// create patient data
		            var newPatient = new Patient();
		            newPatient.userId = newUser;

		            // Get next patient id
		            var pat_id = n + '';
		            var size = 8;
					while (pat_id.length < size) {
						pat_id = '0' + pat_id;
					}

		            newPatient.patient_id = pat_id;
		            newPatient.blood_type = req.body.blood_type;

		        	// save patient data
		            newPatient.save(function(err) {
		            	if (err){
			              console.log('Error in Saving patient: '+err);  
			              req.flash('message','Error in Saving patient: '+err);
			            }
		            	console.log('User Registration successful');
		            	// Set role as patient
						req.session.role = '1';
		            	return done(null, newUser);
		            });
		        });
		      });
		    }
		  });
    });
    };
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
};

module.exports.searchDoctor = function(queryString, callback)
{
	User.find({firstname: new RegExp(queryString, "i"), isDoctor: true}, callback);
};