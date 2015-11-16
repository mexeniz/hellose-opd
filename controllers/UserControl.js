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
						return done(null, false, req.flash('message', 'User not found'));
					}

					// Populate User
					patient.populate('userId', function(err, user) {
						if(err) { return done(err); }

						if(!user)
						{
							return done(null, false, req.flash('message', 'User not found'));
						}

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
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
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
 			newUser.isPatient = true;

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }

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
            
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
};