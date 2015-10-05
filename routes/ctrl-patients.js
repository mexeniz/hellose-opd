var express = require('express');
var router = express.Router();
module.exports = router;

<<<<<<< HEAD

//  creating a GET route for retrieving posts
=======
>>>>>>> master
var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');

<<<<<<< HEAD

/*router.get('/list', function(req, res, next) {
  
  Patient.find(function(err, patient){
    // Check if error
    if(err) { return next(err); }
    // Return view
    res.json(patient);
  });
});*/
=======
/* GET patients page. */
router.get('/', function(req, res, next) {
  res.render('patients/index');
});
>>>>>>> master

// Warehouse for patient list
router.get('/store', function(req, res, next) {
  Patient.find(function(err, patient){
    // Check if error
    if(err) { return next(err); }
<<<<<<< HEAD
    // Return view
    console.log(patient)
    res.json(patient);
  });
  /*res.json([{id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"},
            {id: "asdfsfsdfsf",ssn:"1111111111111",firstname: "นายสมชาย",lastname: "รักสงบ"}]);*/
=======
    res.json(patient);
  });
>>>>>>> master
});


// Information for each patient
<<<<<<< HEAD
router.get('/:patient', function(req, res, next) {
  /*console.log("patient :" +res.patient);
  req.patient.populate('physical_record', function(err, patient) {
    if (err) { return next(err); }
    console.log(patient);
    res.render("patients/info", { patient: patient });
  });*/
    var id = req.params.patient;
=======
router.get('/:patid', function(req, res, next) {
  res.render("patients/info", { patient_id: req.params.patid});
});

router.post('/insert', function(req, res, next) {
  var patient = new Patient(req.body);
  patient.save(function(err, patient){
    if(err){ return next(err); }
    res.json(patient);
  });
});

// Physical Record for individual patient
router.get('/info/:patid', function(req, res, next) {
  var id = req.params.patid;
>>>>>>> master
    Patient.findOne({patient_id: id}, function(err, patient){
          if(err) {
              return res.json(500, {
                  message: 'Error getting patient.'
              });
          }
          if(!patient) {
              return res.json(404, {
                  message: 'No such patient.'
              });
          }
          patient.populate('physical_record', function(err, p) {
<<<<<<< HEAD
              console.log(p);
              //return res.json(p);
              return res.render('patients/info', {patient: p});
          });
    });
});


router.post('/insert', function(req, res, next) {
  var patient = new Patient(req.body);
  patient.save(function(err, patient){
    if(err){ return next(err); }

    res.json(patient);
  });
});

router.post('/:patient/physicalrecord/insert', function(req, res, next) {
  var physicalRecord = new PhysicalRecord(req.body);
  physicalRecord.save(function(err, physicalRecord){
    if(err){ return next(err); }
    req.patient.physical_record.push(physicalRecord._id);
    req.patient.save(function(err, patient) {
      if(err){ return next(err); }
      res.json(physicalRecord);
    });
  });
});

router.param('patient', function(req, res, next, id) {
  //var query = Patient.findByPatientID(id );
  var query = Patient.find({patient_id : id}) ;
  query.exec(function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find post')); }
    req.patient = patient;
    return next();
  });
});
=======
              res.json(p) ;
          });
    });
    // RESERVE FOR MEDICAL RECORDS
  /*req.patient.populate('physical_record', function(err, patient) {
      if (err) { return next(err); }
      req.patient.populate('medical_record', function(err, patient) {
        if (err) { return next(err); }
        res.json(patient);
  });
  });*/
});


/*
router.param('patient', function(req, res, next, id) {
  Patient.findOne({patient_id : id} , function (err, patient){
    if (err) { return next(err); }
    if (!patient) { return next(new Error('can\'t find post')); }
    console.log(patient) ;
    req.patient = patient;
    return next();
  });
});
*/
>>>>>>> master
