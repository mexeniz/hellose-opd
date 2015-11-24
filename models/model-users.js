var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: true, minlength: 6},
  hash: {type: String, required: true},
  salt: {type: String, required: true},
  gender: {type: String, required: true},
  ssn: {type:String, unique: true, required: true, maxlength: 13, minlength: 13},
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  telNum: String,
  email: {type: String, required: true, unique: true},
  isPatient: Boolean,
  isDoctor: Boolean,
  isStaff: Boolean,
  isPharmacist: Boolean,
  isNurse: Boolean,
  isAdmin: Boolean
});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};
module.exports =mongoose.model('User', UserSchema);
