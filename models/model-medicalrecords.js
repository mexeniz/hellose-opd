'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MedicalRecordsSchema = new Schema({
    date: { type: Date, default: Date.now } ,
    //prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    symptoms: 'String',
    diseases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disease' }],
    doctor: 'String'
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordsSchema);