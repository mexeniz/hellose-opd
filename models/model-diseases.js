'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DiseasesSchema = new Schema({
	disease_id_type: { type : 'String' , trim : true , required : true } ,
    disease_id: {type : 'String' , trim : true, required : true, dropDups: true} ,
    name: 'String',
});

module.exports = mongoose.model('Disease', DiseasesSchema);