var express = require('express');
var router = express.Router();
var passport = require('passport');
module.exports = router;


var mongoose = require('mongoose');
var Patient = mongoose.model('Patient');
var PhysicalRecord = mongoose.model('PhysicalRecord');
var Middleware = require('../middlewares/Middleware');
var UserControl = require('../controllers/UserControl.js');
var RoundWardControl = require('../controllers/RoundWardControl.js');
var NotificationControl = require('../controllers/NotificationControl.js');
var AppointmentControl = require('../controllers/AppointmentControl.js');

/* ------------------------------------------------------- */
// Guest Route
router.get('/', function(req, res, next) {
  res.render('guest/welcome');
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
  failureFlash : true 
}));

/* Handle Logout */
router.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});

/* GET Registration Page */
router.get('/register', function(req, res){
  res.render('main/register',{message: req.flash('message')});
});

router.post('/register', function(req, res, next) {
  passport.authenticate('register', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json({status:'failed'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({status:'success'});
    });
  })(req, res, next);
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  // If user is not logged in, redirect to login page
  if(!req.user) {
    return res.redirect('/login');
  } else {
    if(!req.session.role) {
      req.session.role = req.session.flash.message[0];
    }
    var role = req.session.role;
    if(role == '1') {
      console.log('patient');
      res.render('patient/home');
    } else if(role == '2') {
      console.log('doctor');
      res.render('doctor/home');
    } else if(role == '3') {
      res.render('staff/home');
    } else {
      res.render('patient/home');
    }
  }
});

/* ------------------------------------------------------- */
// Cannot Determine

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

router.get('/prescriptions', function(req, res, next) {
  res.render('pharmacist/prescription');
});

/* ------------------------------------------------------- */
// Patient Only Route

// Create appointment
router.get('/appointment/create', function(req, res, next) {
  res.render('patient/create_appointment');
});

// Create appointment post
router.post('/appointment/create', function(req, res, next) {
  res.send('create success');
});

/* ------------------------------------------------------- */
// Doctor Only Route

// Show roundward
router.get('/roundward', function(req, res, next) {
  if(req.user && req.session.role == '2') {
    res.render('doctor/roundward_schedule');
  }
  res.redirect('/login');
});

// Add roundward
router.get('/roundward/add', function(req, res, next) {
  if(req.user && req.session.role == '2') {
    res.render('doctor/add_roundward');
  }
  res.redirect('/login');
});

// Add roundward post
router.post('/roundward/add', function(req, res, next) {
    if(req.user && req.session.role == '2') {
      RoundWardControl.addRoundward(req.body,function(err,result){
        if(err){
          return next(err);
        }else{
          return res.json(result);
        }
      });
    }
    return res.json({message: "Error page not found"});
});

// Create appointment
router.get('/patient/:patientId/create_appointment', function(req, res, next) {
  if(req.user && req.session.role == '2') {
    res.render('doctor/create_appointment', { patient_id : req.param.patientId });
  }
  res.redirect('/login');
});

// Create appointment post
router.post('/patient/:patientId/create_appointment', function(req, res, next) {
  if(req.user && req.session.role == '2') {
    res.send('create success');
  }
  res.send('Error page not found');
});

/* ------------------------------------------------------- */
// Patient and Doctor Route

// List appointment
router.get('/appointment', function(req, res, next) {
  if(req.user) {
    if(req.session.role == '1') {
      res.render('patient/list_appointment');
    }
    else if(req.session.role == '2') {
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
    if(req.session.role == '1') {
      res.render('patient/edit_appointment');
    }
    else if(req.session.role == '2') {
      res.render('doctor/edit_appointment');
    }
    else if(req.session.role == '3') {
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
    if(req.session.role == '1') {
      res.render('patient/edit_appointment');
    }
    else if(req.session.role == '3') {
      res.render('staff/edit_appointment');
    }
  }
  res.redirect('/login');
});

// View appointment
router.get('/appointment/:appId', function(req, res, next) {
  if(req.user) {
    if(req.session.role == '1') {
      res.render('patient/view_appointment');
    }
    else if(req.session.role == '3') {
      res.render('staff/view_appointment');
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */
// Patient and  Staff and Pharmacist and Nurse

// Information for each user
router.get('/profile', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role == '1') {
      res.render('patient/view_profile', { patient_id: req.user._id });
    }
    else if (req.session.role == '3') {
      res.render('staff/view_profile', { staff_id: req.user._id });
    }
    else if (req.session.role == '4') {
      res.render('pharmacist/view_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role == '5') {
      res.render('nurse/view_profile', { nurse_id: req.user._id });
    }
  }
  res.redirect('/login');
});


// Edit profile page
router.get('/profile/edit', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role == '1') {
      res.render('patient/edit_profile', { patient_id: req.user._id });
    }
    else if (req.session.role == '3') {
      res.render('staff/edit_profile', { staff_id: req.user._id });
    }
    else if (req.session.role == '4') {
      res.render('pharmacist/edit_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role == '5') {
      res.render('nurse/edit_profile', { nurse_id: req.user._id });
    }
  }
  res.redirect('/login');
});

// Edit profile page post
router.post('/profile/edit', function(req, res, next) {
  // Have to add authenticate
  if(req.user) {
    if(req.session.role == '1') {
      res.render('patient/edit_profile', { patient_id: req.user._id });
    }
    else if (req.session.role == '3') {
      res.render('staff/edit_profile', { staff_id: req.user._id });
    }
    else if (req.session.role == '4') {
      res.render('pharmacist/edit_profile', { pharmacist_id: req.user._id });
    }
    else if (req.session.role == '5') {
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
    if(req.session.role == '2') {
      res.render('doctor/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role == '3') {
      res.render('staff/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role == '4') {
      res.render('pharmacist/patient_profile', { patient_id : req.param.patientId });
    }
    else if (req.session.role == '5') {
      res.render('nurse/patient_profile', { patient_id : req.param.patientId });
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */

// Staff and Pharmacist and Nurse
router.get('/patient', function(req, res, next) {
  if(req.user) {
    if(req.session.role == '3') {
      res.render('staff/list_patient');
    }
    else if(req.session.role == '4') {
      res.render('pharmacist/list_patient');
    }
    else if(req.session.role == '5') {
      res.render('nurse/list_patient');
    }
  }
  res.redirect('/login');
});

/* ------------------------------------------------------- */

// Staff only
router.get('/patient/:patientId/edit', function(req, res, next) {
  if(req.user && req.session.role == '3') {
    res.render('staff/edit_patient_profile');
  }
  res.redirect('/login');
});

router.post('/patient/:patientId/edit', function(req, res, next) {
  if(req.user && req.session.role == '3') {
    res.render('staff/edit_patient_profile');
  }
  res.redirect('/login');
});

router.get('/roundward/import', function(req, res, next) {
  if(req.user && req.session.role == '3') {
    res.render('staff/import_roundward.ejs');
  }
  res.redirect('/login');
});

router.post('/roundward/import', function(req, res, next) {
  if(req.user && req.session.role == '3') {
    res.render('staff/import_roundward.ejs');
  }
  res.redirect('/login');
});
