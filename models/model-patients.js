'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var PatientsSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patient_id: {type : 'String' , maxlength: 8, minlength: 8, trim : true , unique : true},
    blood_type: 'String',
    physical_record: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PhysicalRecord' }],
    medical_record: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
    prescription_record: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }]
});

/*
{
    userId: ObjectId("564ecbd6bd46ea782b4df536"),
    patient_id: 12345678,
    blood_type: 'B',
    physical_record: [],
    medical_record: [],
    prescription_record: []
}

*/

module.exports = mongoose.model('Patient', PatientsSchema);
