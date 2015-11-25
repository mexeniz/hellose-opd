'use strict';

var mongoose = require('mongoose');
var Medicine = mongoose.model('Medicine');

module.exports.addMedicine = function(name, done) {
	var medicine = new Medicine({ name: name });
	medicine.save(function (err, medicine) {
	  if (err) {
	  	return done(null,false);
	  }
	  
	  if(medicine) {
	  	return done(null,medicine);
	  }
	});
}

module.exports.getMedicine = function(done) {
	Medicine.find(function(err, medicines) {
		if (err) {
			return done(null, false);
		}

		if(medicines) {
			return done(null,medicines);
		}
	});
}

module.exports.updateMedicine = function(med_id, name, done) {
	var query = {};
	query._id = med_id;
	Medicine.findOne(function(err, medicine) {
		if (err) {
			return done(null, false);
		}
		if(medicine) {
			medicine.name = name;
			medicine.save(function(err, result) {
				if (err) {
					return done(null, false);
				}
				if(result) {
					return done(null, result);
				}
			});
		}
	});
}

module.exports.deleteMedicine = function(med_id, done) {
	var query = {};
	query._id = med_id;
	Medicine.remove(query, function(err) {
    if (err) {
        return done(null, false);
    }
    else {
        return done(null, true);
    }
});
}