'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PrescriptionsSchema = new Schema({
    date: { type: Date, default: Date.now } ,
    med_dosage_list: [{ medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, dosage: 'String', howTo: 'String' }],
    status: { type: 'String', default: 'Pending' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctor: { type: 'String', default: 'Anonymous' },
    pharmacist: { type: 'String', default: 'Anonymous' }
});

module.exports = mongoose.model('Prescription', PrescriptionsSchema);