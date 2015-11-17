'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Patient = mongoose.model('Patient');

module.exports.login = function(req, username, password, done) { 
	// check in mongo if a user with username exists or not
	User.findOne({ $or:[ { 'username': username }, { 'ssn': username } ] }, 
		function(err, user) {
			// In case of any error, return using the done method
			if(!user)
			{
				// Find using patient_id
				Patient.findOne({ 'patient_id': username }, function(err, patient) {
					if(err) { return done(err); }
					if(!patient)
					{
						console.log('User not found!');
						return done(null, false, req.flash('message', 'User not found'));
					}

					// Populate User
					patient.populate('userId', function(err, patient) {
						if(err) { return done(err); }

						if(!patient.userId)
						{	
							console.log('User not found!');
							return done(null, false, req.flash('message', 'User not found'));
						}

						// Check password
						if(!patient.userId.validPassword(password))
						{
							console.log('Invalid Password');
							return done(null, false, 
							req.flash('message', 'Invalid Password'));
						}

						// User and password both match, return user from 
						// done method which will be treated like success
						return done(null, patient.userId);
					});
				});
			}

			else
			{
				// Check password
				if(!user.validPassword(password))
				{
					console.log('Invalid Password');
					return done(null, false, 
					req.flash('message', 'Invalid Password'));
				}
				
				// User and password both match, return user from 
				// done method which will be treated like success
				return done(null, user);
			}
			
		}
	);
};

module.exports.register = function(req, username, password, done) {
	var ssn = req.body.ssn;
	console.log(ssn);
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
					// Create new patient data
					var newPatient = new Patient();
				    newPatient.userId = newUser;
				    newPatient.save(function(err) {
				    	if (err){
				          console.log('Error in Saving patient: '+err);  
				          throw err;
				        }
				    	console.log('User Registration successful');    
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
 			newUser.prefix = req.body.prefix;
 			newUser.gender = req.body.gender;
 			newUser.ssn = ssn;
 			newUser.firstname = req.body.firstname;
 			newUser.lastname = req.body.lastname;
 			newUser.telNo = req.body.telNo;
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