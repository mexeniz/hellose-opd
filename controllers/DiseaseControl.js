'use strict';

var mongoose = require('mongoose');
var Disease = mongoose.model('Disease');

module.exports.addDisease = function(disease_id_type,disease_id, disease_name, done) {
	var disease = new Disease({ disease_id_type: disease_id_type, disease_id: disease_id, name: disease_name });
	disease.save(function (err, disease) {
	  if (err) {
	  	return done(null,false);
	  }
	  
	  if(disease) {
	  	return done(null,disease);
	  }
	});
}

module.exports.getDisease = function(done) {
	Disease.find(function(err, diseases) {
		if (err) {
			return done(null, false);
		}

		if(diseases) {
			return done(null,diseases);
		}
	});
}

module.exports.updateDisease = function(dis_unique_id, dis_id_type, dis_id, dis_name, done) {
	var query = {};
	Disease.update({ _id: dis_unique_id, })
	query._id = dis_unique_id;
	Disease.findOne(function(err, disease) {
		if (err) {
			return done(null, false);
		}
		if(disease) {
			disease.disease_id_type = dis_id_type;
			disease.disease_id = dis_id;
			disease.name = dis_name;
			disease.save(function(err, result) {
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

module.exports.deleteDisease = function(dis_id, done) {
	var query = {};
	query._id = dis_id;
	Disease.remove(query, function(err) {
    if (err) {
        return done(null, false);
    }
    else {
        return done(null, true);
    }
});
}