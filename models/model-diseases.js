'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DiseasesSchema = new Schema({
    disease_id: {type : 'String' , trim : true , unique : true, required : true, dropDups: true} ,
    base_sympton: 'String' ,
    name: 'String',
    treatment: 'String'
});

module.exports = mongoose.model('Disease', DiseasesSchema);