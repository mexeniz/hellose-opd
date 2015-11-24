var express = require('express');
var router = express.Router();
var passport = require('passport');
module.exports = router;


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
  res.send('create success');
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
  if(req.user && req.session.role === '2')
  {
    var userId = req.user._id; //GetFromSession
    var roundward_id = mongoose.Types.ObjectId(req.body['rwId']);
    RoundWardControl.cancelRoundward(userId,roundward_id,function(err,result){
      if(err){
        return next(err);
      }else{
        return res.json(result);
      }
    });
  }
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


// Add roundward post
router.post('/addRoundward', function(req,res,next){
  if(req.user && req.session.role === '2')
  {
    var roundward = {date:req.body['date'],
          time:req.body['time']};
    var userId = req.user._id; //GetFromSession
    RoundWardControl.addRoundWard(userId,roundward,function(err,result){
      if(err){
        return next(err); 
      }
      return res.json(result);
    });
  }
});

// Create appointment
router.get('/patient/:patientId/create_appointment', function(req, res, next) {
  if(req.user && req.session.role === '2') {
    res.render('doctor/create_appointment', { patient_id : req.param.patientId });
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
      res.render('patient/list_appointment');
    }
    else if(req.session.role === '2') {
      res.render('doctor/list_appointment');
    }
  }
  res.redirect('/login');
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
    if(req.session.role === '1') {
      res.render('patient/view_appointment');
    }
    else if(req.session.role === '3') {
      res.render('staff/view_appointment');
    }
  }
  res.redirect('/login');
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
      res.render('doctor/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role === '3') {
      res.render('staff/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role === '4') {
      res.render('pharmacist/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role === '5') {
      res.render('nurse/patient_profile', { patient_id : req.param.patientId });
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
router.get('/user', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/user');
  }
  res.redirect('/login');
});


router.get('/medicine', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/medicine');
  }
  res.redirect('/login');
});

router.get('/disease', function(req, res, next) {
  if(req.user && req.session.role === '6') {
    res.render('admin/disease');
  }
  res.redirect('/login'); 
});

