'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Patient = mongoose.model('Patient');

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
	}
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
	);
};

module.exports.register = function(req, username, password, done) {
	var ssn = req.body.ssn;

    var findOrCreateUser = function(){
      // find a user in Mongo with provided username or ssn
      User.findOne({ $or:[ { 'username': username }, { 'ssn': ssn } ] }, function(err, user) {
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
			 		req.flash('message','User Already Exists'));
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
				          throw err;
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
 			newUser.ssn = ssn;
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
              throw err;  
            }

            // Count all patient number
            Patient.count({}, function(err, n) {
            	if(err) {
            		console.log('Error in Saving user: '+err);  
              		throw err;  
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
		              throw err;
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
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
};

module.exports.searchDoctor = function(queryString, callback)
{
	User.find({firstname: new RegExp(queryString, "i"), isDoctor: true}, callback);
};