'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Patient = mongoose.model('Patient');

module.exports.login = function(req, username, password, done) { 
	// check in mongo if a user with username exists or not
	User.findOne({ 'username' :  username }, 
		function(err, user) {
			// In case of any error, return using the done method
			if (err) { return done(err); }
			// Username does not exist, log error & redirect back
			if (!user){
				console.log('User Not Found with username '+username);

				// Find using SSN
				var ssn = req.body.ssn;
				User.findOne({ 'ssn': ssn }, function(err, user) {
					if(err) { return done(err); }
					if(!user)
					{
						console.log('User Not Found with ssn '+ssn);

						if(req.body.isPatient)
						{
							// Find using patient id
							Patient.findOne({ 'patient_id': username, function(err, user) {
								if(err) { return done(err); }
								if(!user) {
									return done(null, false, 
									req.flash('message', 'User Not found.'));
								}

								// Check password
								if(!user.validPassword(password))
								{
									// User exists but wrong password, log the error 
									if (!user.validPassword(password)){
										console.log('Invalid Password');
										return done(null, false, 
										req.flash('message', 'Invalid Password'));
									}
									// User and password both match, return user from 
									// done method which will be treated like success
									return done(null, user);
								}
							}});
						}
						else
						{
							return done(null, false, 
							req.flash('message', 'User Not found.'));
						}
					}
				});
			}
			
			// User and password both match, return user from 
			// done method which will be treated like success
			return done(null, user);
		}
	);
};