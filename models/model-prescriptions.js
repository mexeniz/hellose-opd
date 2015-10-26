'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PrescriptionsSchema = new Schema({
    date: { type: Date, default: Date.now } ,
    med_dosage_list: [ medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, dosage: 'String'],
    status: 'String',
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctor: 'String',
    pharmacist: 'String'
});

module.exports = mongoose.model('Prescription', PrescriptionsSchema);