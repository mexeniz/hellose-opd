'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MedicinesSchema = new Schema({
    name: {type : 'String' , trim : true, required : true, dropDups: true}
});

module.exports = mongoose.model('Medicine', MedicinesSchema);