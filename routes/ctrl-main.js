var express = require('express');
var router = express.Router();
var passport = require('passport');
module.exports = router;
var nodemailer = require('nodemailer');

var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');
var User = mongoose.model('User');
var Middleware = require('../middlewares/Middleware');
var UserControl = require('../controllers/UserControl.js');
var RoundWardControl = require('../controllers/RoundWardControl.js');
var NotificationControl = require('../controllers/NotificationControl.js');
var AppointmentControl = require('../controllers/AppointmentControl.js');
var PatientControl = require('../controllers/PatientControl');
var MedicineControl = require('../controllers/MedicineControl');
var DepartmentControl = require('../controllers/DepartmentControl');
var DiseaseControl = require('../controllers/DiseaseControl');

/* ------------------------------------------------------- */

// Guest Route
router.get('/', function(req, res, next) {
  if(req.user)
  {
    // If logged in, go to homepage
    res.redirect('/home');
  }
  else
  {
    // If not, go to login page
    res.render('guest/login');
  }
  
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  // Show login page
  if(!req.user) {
    res.render('guest/login');
  } else {
    res.redirect('/home');
  }
});

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash : true,
}));

/* Handle Logout */
router.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});

/* GET Registration Page */
router.get('/register', function(req, res){
  res.render('register/register',{message: req.flash('message')});
});

router.post('/register', function(req, res, next) {
  passport.authenticate('register', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.json({status:'failed', message: req.flash('message')}); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
          return res.json({status:'success'});
      });
    })(req, res, next);
});
/* GET Reset Password Page */
router.get('/reset_password', function(req, res){
  res.render('register/reset_password');
});

router.post('/reset_password', function(req, res, next) {
  var email = req.body.email ;
  // Do something to reset password
  res.json({status:'success'});
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  // If user is not logged in, redirect to login page
  if(!req.user) {
    return res.redirect('/login');
  } else {
    var role = req.session.role;
    if(role === '1') {
      console.log('patient');
      res.render('patient/home');
    } else if(role === '2') {
      console.log('doctor');
      res.render('doctor/home');
    } else if(role === '3') {
      res.render('staff/home');
    } else if(role === '4') {
      res.render('pharmacist/home');
    } else if(role === '5') {
      res.render('nurse/home');
    } else if(role === '6') {
      res.render('admin/home');
    } else {
      res.render('patient/home');
    }
  }
});

/* ------------------------------------------------------- */
// Cannot Determine

/* Find user who is a doctor by name */
router.get('/doctor/find/:query', function(req, res, next){
  var query = req.params.query;
  console.log('query ' + query);
  UserControl.searchDoctor(query, function(err, result)
  {
    if(err) { return next(err); }
    return res.json(result);
  });
});

/* GET import schedule page. */
router.get('/import_schedule', function(req, res, next) {
  res.render('mockup/import_schedule');
});
/* GET import schedule page. */
router.get('/create_appointment', function(req, res, next) {
  res.render('mockup/create_appointment');
});

router.get('/patientViewAppointment', function(req,res) {
	res.render('mockup/patientViewAppointment');
  });

/* ------------------------------------------------------- */
// Patient Only Route

// Create appointment
router.get('/appointment/create', function(req, res, next) {
  if(req.user && req.session.role === '1')
  {
    res.render('patient/create_appointment');
  }
});

router.get('/appointment/create/:patientId/:patientName/:patientLastname', function(req, res, next)
{
  if(req.user && req.session.role === '2')
  {
    var patientid = req.params.patientId;
    var patientName = req.params.patientName;
    var patientLastname = req.params.patientLastname;
    var curDate = new Date();
    console.log(patientid + patientName + patientLastname + req.session.doctor_id);
    RoundWardControl.getAvailableDateTime(req.session.doctor_id,curDate.getMonth(),curDate.getFullYear(),function(err,result){
      if(err){
        return next(err);
      }else{
        if(result.length > 0)
        {
          console.log(result);
          res.render('doctor/create_appointment', { earliestData: JSON.stringify(result[0]), patientId: patientid, patientName: patientName, patientLastname: patientLastname });
        }
        else
        {
          console.log('wtf');
          //res.render('doctor/create_appointment', req.flash( {message: 'คุณไม่เหลือเวลาว่างแล้ว'}));
          res.sendStatus(404);
        }
      }
    });
  }
});

// Create appointment
router.get('/appointment/confirm_Doctor/:doctorId', function(req, res, next) {
  //if(req.user && req.session.role === '1')
  {
    var doctorid = req.params.doctorId;
    var curDate = new Date();
    RoundWardControl.getAvailableDateTime(doctorid,curDate.getMonth(),curDate.getFullYear(),function(err,result){
      if(err){
        return next(err);
      }else{
        if(result.length > 0)
        {
          res.render('patient/confirm_appointment', { earliestData: JSON.stringify(result[0]) });
        }
        else
        {
          res.render('patient/create_appointment', req.flash( {message: 'แพทย์ไม่ว่างเลย'}));
        }
      }
    });
    
  }
});

// Create appointment post
router.post('/appointment/create', function(req, res, next) {
  var patientId = '';
  var doctorId = '';
  if(req.user)
  {
    if(req.session.role === '1') // Patient
    {
      patientId = req.user._id;
      doctorId = req.body['doctor_id'];

    }
    else if(req.session.role === '2') // Doctor
    {
      patientId = req.body['patient_id'];
      doctorId = req.user._id;
      console.log('pat = ' + patientId + ' doc ' + doctorId);
    } 
    else if(req.session.role === '3') // Staff
    {
      patientId = req.body['patient_id'];
      doctorId = req.body['doctor_id'];
    }
    else
    {
      res.send('No permission');
    }
  }
  else
  {
    return res.redirect('/login');
  }
  var appInfo = {
    doctor_id : mongoose.Types.ObjectId(doctorId),
    patient_id : mongoose.Types.ObjectId(patientId), 
    date : new Date(req.body['date']),
    time : req.body['time'],
    slot : req.body['slot'],
    status : req.body['status'],
    causes : req.body['causes']
  };

  //console.log(appInfo);

  AppointmentControl.createAppointment(appInfo,function(err,result){
    if(err){
      console.log(err);
      return next(err);
    }else{
      console.log('success');
      return res.json(result);
    }
  });
});

// Cancel appointment
router.delete('/appointment/:appId/cancel', function(req, res, next)
{
  if(req.user)
  {
    if(req.session.role === '1' || req.session.role === '3') // Patient or Staff
    {
      var appId = req.params.appId;
      AppointmentControl.cancelAppointment(appId, function(err, result)
      {
        if(err) { return next(err); }
        console.log('successfully cancelled');
        return res.json(result);
      });
    }
    else
    {
      return res.sendStatus(404);
    }
  }
  else
  {
    return res.sendStatus(404);
  }
});

/* ------------------------------------------------------- */
// Doctor Only Route

// Show roundward
router.get('/roundward', function(req, res, next) {
  if(req.user && req.session.role === '2') {
    res.render('doctor/roundward_schedule');
  }
  res.redirect('/login');
});

// Get roundward data of a doctor by month and year
router.post('/getRoundward',function(req,res,next){
  
  if(req.user && req.session.role === '2')
  {
    var month = req.body['month'];
    var year = req.body['year'];
    RoundWardControl.getRoundward(req.user._id,month,year,function(err,result){
      if(err){
        return next(err);
      }else{
        return res.json(result);
      }
    });
  }
  
});

//DELETE ROUNDWARD FROM A SINGLE DOCTOR
router.post('/cancelRoundward', function(req,res,next){
  //if(req.user && req.session.role === '2')
  //{
    var userId = req.user._id; //GetFromSession
    //var userId = req.body['userId']; //doctor's userId FROM User Schema
    var roundward_id = mongoose.Types.ObjectId(req.body['rwId']);
    RoundWardControl.cancelRoundward(userId,roundward_id,function(err,result){
      if(err){
        return next(err);
      }else{
        //Result is PatientARRAY
        
        return res.json(result);
      }
    });
  //}
});

//GET A FREE SLOT ROUNDWARD FROM A DOCTOR in A MONTH
//BUSY ROUNDWARD WILL NOT BE FETCHED
router.post('/getAvailableDateTime', function(req,res,next){
  console.log("request");
  if(true)
  //if(req.user && (req.session.role === '1' || req.session.role === '2' || req.session.role === '3'))
  {

    var doctor_id = req.session.role === '2' ? req.user._id : req.body['doctor_id']; // If doctor, use user id of doctor, else must pass doctorid(userid of doctor)
    var month = req.body['month'];
    var year = req.body['year'];

    console.log('ctrl-main.js[218] : '+doctor_id);

    RoundWardControl.getAvailableDateTime(doctor_id,month,year,function(err,result) {
      if(err){
        return next(err);
      }else{    
        return res.json(result);
      }
    });
  }

});


//GET MONTHLY ROUNDWARD OF THE ENTIRE DEPARTMENT
router.post('/getDepartmentFreeMonth',function(req,res,next){
  //Query Free Slot in a Month with Every Doctor in that Department
  var month = req.body['month'];
  var department = req.body['department'];
  var year = req.body['year'];
  RoundWardControl.getDepartmentFreeMonth(month,year,department,function(err,result){
    if(err){
      return next(err);
    }else{
      return res.json(result);
    }
  });
});



// Add roundward
router.get('/roundward/add', function(req, res, next) {
  if(req.user && req.session.role === '2') {
    res.render('doctor/add_roundward');
  }
  res.redirect('/login');
});


router.post('/kuy',function(req,res,next){
    var department = req.body['department'];
    RoundWardControl.getEarliest (department,function(err,result){
      if(err){
        return next(err);
      }
      return res.json(result);
    });
});

// Add roundward post
router.post('/addRoundward', function(req,res,next){
  //if(req.user && req.session.role === '2')
  //{
    var roundward = {date:req.body['date'],
          time:req.body['time']};
    //var userId = req.body['doctor_id'];
    var userId = req.user._id; //GetFromSession
    RoundWardControl.addRoundWard(userId,roundward,function(err,result){
      if(err){
        return next(err); 
      }
      return res.json(result);
    });
  //}
});

// Create appointment
router.get('/patient/:patientId/create_appointment', function(req, res, next) {
  if(req.user && req.session.role === '2') {
    res.render('doctor/create_appointment', { patient_id : req.params.patientId });
  }
  res.redirect('/login');
});

// Create appointment post
router.post('/patient/:patientId/create_appointment', function(req, res, next) {
  if(req.user && req.session.role === '2') {
    res.send('create success');
  }
  res.send('Error page not found');
});

/* ------------------------------------------------------- */
// Patient and Doctor Route

// List appointment
router.get('/appointment', function(req, res, next) {
  if(req.user) {
    if(req.session.role === '1') {
      return res.render('patient/list_appointment');
    }
    else if(req.session.role === '2') {
      return res.render('doctor/list_appointment');
    }
  }
  res.redirect('/login');
});


// Get list of appointment
router.get('/appointment/list', function(req, res, next) {
  if(req.user) {
    var returnFunction = function(err, result)
    {
      if(err) { next(err); }
      return res.json(result);
    };

    if(req.session.role === '1') { // Patient
      AppointmentControl.getAppointmentByPatientId(req.session.patient_id, returnFunction);
    }
    else if(req.session.role === '2') { // Doctor
      AppointmentControl.getAppointment(req.session.doctor_id, returnFunction);
    }
    else
    {
      res.json([]);
    }
  }
  else
  {
    res.json([]);
  }
});

// Get list of appointment
router.get('/appointment/list/:year/:month', function(req, res, next) {
  if(req.user) {
    var returnFunction = function(err, result)
    {
      if(err) { next(err); }
      return res.json(result);
    };

    if(req.session.role === '2') { // Doctor
      var month = req.params.month;
      var year = req.params.year;
      AppointmentControl.getAppointment(mongoose.Types.ObjectId(req.session.doctor_id), month, year, returnFunction);
    }
    else
    {
      res.json([]);
    }
  }
  else
  {
    res.json([]);
  }
});

/* ------------------------------------------------------- */
// Patient and Doctor and Staff Route

// Edit appointment
router.get('/appointment/:appId/edit', function(req, res, next) {
  if(req.user) {
    if(req.session.role === '1') {
      res.render('patient/edit_appointment');
    }
    else if(req.session.role === '2') {
      res.render('doctor/edit_appointment');
    }
    else if(req.session.role === '3') {
      res.render('staff/edit_appointment');
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */
// Patient and Staff Route

// Edit appointment
router.post('/appointment/:appId/edit', function(req, res, next) {
  if(req.user) {
    if(req.session.role === '1') {
      res.render('patient/edit_appointment');
    }
    else if(req.session.role === '3') {
      res.render('staff/edit_appointment');
    }
  }
  res.redirect('/login');
});

// View appointment
router.get('/appointment/:appId', function(req, res, next) {
  if(req.user) {
    var appId = req.params.appId;

    if(req.session.role === '1') {
      return res.render('patient/view_appointment', { appId: appId });
    }
    else if(req.session.role === '2')
    {
      return res.render('doctor/view_appointment', { appId: appId });
    }
    else if(req.session.role === '3') {
      res.render('staff/view_appointment');
    }
    else
    {
      res.redirect('/login');
    }
  }
  else
  {
    res.redirect('/login');
  }  
});

// Get appointment info by id
router.get('/appointment/info/:appId', function(req, res, next) {
  if(req.user) {
    var appId = req.params.appId;

    AppointmentControl.getAppointmentById(appId, function(err, result){
      res.json(result);
    });
  }
  else
  {
    res.json();
  }
});

/* ------------------------------------------------------- */
// Patient and  Doctor and Staff and Pharmacist and Nurse

// Information for each user
router.get('/profile', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role === '1') {
      res.render('patient/view_profile', { patient_id: req.user._id });
    }
    else if (req.session.role === '2' ) {
      res.render('doctor/view_profile', { doctor_id: req.user._id });
    }
    else if (req.session.role === '3') {
      res.render('staff/view_profile', { staff_id: req.user._id });
    }
    else if (req.session.role === '4') {
      res.render('pharmacist/view_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role === '5') {
      res.render('nurse/view_profile', { nurse_id: req.user._id });
    }
  }
  res.redirect('/login');
});


// Edit profile page
router.get('/profile/edit', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role === '1') {
      res.render('patient/edit_profile', { patient_id: req.user._id });
    }
    else if (req.session.role === '2') {
      res.render('doctor/edit_profile', { doctor_id: req.user._id});
    }
    else if (req.session.role === '3') {
      res.render('staff/edit_profile', { staff_id: req.user._id });
    }
    else if (req.session.role === '4') {
      res.render('pharmacist/edit_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role === '5') {
      res.render('nurse/edit_profile', { nurse_id: req.user._id });
    }
  }
  res.redirect('/login');
});

// Edit profile page post
router.post('/profile/edit', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role === '1') {
      res.render('patient/edit_profile', { patient_id: req.user._id });
    }
    else if (req.session.role === '3') {
      res.render('staff/edit_profile', { staff_id: req.user._id });
    }
    else if (req.session.role === '4') {
      res.render('pharmacist/edit_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role === '5') {
      res.render('nurse/edit_profile', { nurse_id: req.user._id });
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */
// Doctor and Staff and Pharmacist and Nurse

// Show patient profile
router.get('/patient/:patientId', function(req, res, next) {
  if(req.user) {
    if(req.session.role === '2') {
      console.log('patient profile doctor view');
      return res.render('doctor/patient_profile', { patient_id : req.params.patientId , user_id : req.session.passport.user});
    }
    else if (req.session.role === '3') {
      return res.render('staff/patient_profile', { patient_id : req.params.patientId });
    }
    else if (req.session.role === '4') {
      return res.render('pharmacist/patient_profile', { patient_id : req.params.patientId });
    }
    else if (req.session.role === '5') {
      return res.render('nurse/patient_profile', { patient_id : req.params.patientId });
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */

// Staff and Pharmacist and Nurse
router.get('/patient', function(req, res, next) {
  if(req.user) {
    if(req.session.role === '3') {
      res.render('staff/list_patient');
    }
    else if(req.session.role === '4') {
      res.render('pharmacist/list_patient');
    }
    else if(req.session.role === '5') {
      res.render('nurse/list_patient');
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */

// Staff only
router.get('/patient/:patientId/edit', function(req, res, next) {
  if(req.user && req.session.role === '3') {
    res.render('staff/edit_patient_profile');
  }
  res.redirect('/login');
});

router.get('/roundward/import', function(req, res, next) {
  if(req.user && req.session.role === '3') {
    res.render('staff/import_roundward');
  }
  res.redirect('/login');
});

//IMPORT ROUNDWARD FROM A CSV FILE
router.post('/importRoundward', function(req,res,next){
  if(req.user && req.session.role === '3')
  {
    //Use This Place (Router) to Split File
    var longStream = req.body;
    var startDate = new Date(longStream.year,longStream.month);
    RoundWardControl.importRoundWard(startDate,longStream.data,function(err,result){
      if(err){
        return next(err);
      }else{
        return res.json(result);
      }
    });
  }
  
});

/* ------------------------------------------------------- */

// Pharmacist only
// List prescription
router.get('/prescription', function(req, res, next) {
  if(req.user && req.session.role === '4') {
    res.render('pharmacist/list_prescription');
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */

// Admin only

// List all user
router.get('/user', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/user');
  }
  res.redirect('/login');
});

// List all user post
router.get('/store/user', function(req, res, next) {
  //if(req.user && req.session.role === '6') {
    UserControl.listUser(function(err, result) {
      if(err) {
        res.json({result: 'Error'});
      } 
      if(result) {
        res.json(result);
      }
    });
  //}
  //res.json({result: 'You cannot access this data'});
});

// Update user
router.post('/user/:userId', function(req, res, next) {
  var user_id = req.params.userId;
  var role = {};
  role.isPatient = req.body.isPatient;
  role.isDoctor = req.body.isDoctor;
  role.isStaff = req.body.isStaff;
  role.isPharmacist = req.body.isPharmacist;
  role.isNurse = req.body.isNurse;
  if(role.isDoctor) {
    role.department = req.body.department;
  }
  UserControl.updateUser(user_id, role, function(err, result) {
    if (err) {
      res.json({result: 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Delete user
router.post('/user/:userId/delete', function(req, res, next) {
  var user_id = req.params.userId;
  UserControl.deleteUser(user_id, function(err, result) {
    if (err) {
      res.json({result: 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

//List Medicine
router.get('/medicine', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/medicine');
  }
  res.redirect('/login');
});

// List medicine backend
router.get('/store/medicine', function(req, res, next) {
  MedicineControl.getMedicine(function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Add medicine
router.post('/medicine/add', function(req, res, next) {
  var name = req.body.name;
  MedicineControl.addMedicine(name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Delete Medicine
router.post('/medicine/:medId/delete', function(req, res, next) {
  var med_id = req.params.medId;
  MedicineControl.deleteMedicine(med_id, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json({result : 'Success'});
    }
  });
});

// Update Medicine
router.post('/medicine/:medId/edit', function(req, res, next) {
  var med_id = req.params.medId;
  var name = req.body.name;
  MedicineControl.updateMedicine(med_id, name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// List disease
router.get('/disease', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/disease');
  }
  res.redirect('/login'); 
});

// List disease backend
router.get('/store/disease', function(req, res, next) {
  DiseaseControl.getDisease(function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Add disease
router.post('/disease/add', function(req, res, next) {
  var dis_id_type = req.body.disease_id_type;
  var dis_id = req.body.disease_id;
  var dis_name = req.body.name;
  DiseaseControl.addDisease(dis_id_type, dis_id, dis_name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Delete disease
router.post('/disease/:disId/delete', function(req, res, next) {
  var dis_id = req.params.disId;
  DiseaseControl.deleteDisease(dis_id, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json({result : 'Success'});
    }
  });
});

// Update Disease
router.post('/disease/:disId/edit', function(req, res, next) {
  var dis_unique_id = req.params.disId;
  var dis_id_type = req.body.disease_id_type;
  var dis_id = req.body.disease_id;
  var dis_name = req.body.name;
  DiseaseControl.updateDisease(dis_unique_id, dis_id_type, dis_id, dis_name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});


// List Department
router.get('/department', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/department');
  }
  req.redirect('/login');
});

// List department backend
router.get('/store/department', function(req, res, next) {
  DepartmentControl.getDepartment(function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Add department
router.post('/department/add', function(req, res, next) {
  var name = req.body.name;
  DepartmentControl.addDepartment(name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});

// Delete Department
router.post('/department/:deptId/delete', function(req, res, next) {
  var dept_id = req.params.deptId;
  DepartmentControl.deleteDepartment(dept_id, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json({result : 'Success'});
    }
  });
});

// Update Department
router.post('/department/:deptId/edit', function(req, res, next) {
  var dept_id = req.params.deptId;
  var dept_name = req.body.name;
  DepartmentControl.updateDepartment(dept_id, dept_name, function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json(result);
    }
  });
});


router.get('/user/fullname/:userId', function(req, res) {
  var user_id = req.params.userId;
  User.findOne({_id : user_id},function(err, result) {
    if (err) {
      res.json({result : 'Error'});
    }
    if (result) {
      res.json({fullname : result.firstname + " " + result.lastname});
    } 
  });
});

