'use strict';

var mongoose = require('mongoose');
var Department = mongoose.model('Department');

module.exports.addDepartment = function(name, done) {
	var department = new Department({ name: name });
	department.save(function (err, department) {
	  if (err) {
	  	return done(null,false);
	  }
	  
	  if(department) {
	  	return done(null,department);
	  }
	});
};

module.exports.getDepartment = function(done) {
	Department.find(function(err, departments) {
		if (err) {
			return done(null, false);
		}

		if(departments) {
			return done(null,departments);
		}
	});
};

module.exports.updateDepartment = function(dept_id, dept_name, done) {
	var query = {};
	query._id = dept_id;
	Department.findOne(query, function(err, department) {
		if (err) {
			return done(null, false);
		}
		if(department) {
			department.name = dept_name;
			department.save(function(err, result) {
				if (err) {
					return done(null, false);
				}
				if(result) {
					return done(null, result);
				}
			});
		}
	});
};

module.exports.deleteDepartment = function(dept_id, done) {
	var query = {};
	query._id = dept_id;
	Department.remove(query, function(err) {
	    if (err) {
	        return done(null, false);
	    }
	    else {
	        return done(null, true);
	    }
	});
};