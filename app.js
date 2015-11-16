var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-locals');
var session = require('express-session');
var flash = require('connect-flash');
//DB Connection
var mongoose = require('mongoose');
var passport = require('passport');

// Models
require('./models/model-patients');
require('./models/model-physicalrecords');
require('./models/model-medicalrecords');
require('./models/model-diseases');
require('./models/model-appointment');
require('./models/model-prescriptions');
require('./models/model-medicines');
require('./models/model-users');

// Configs
require('./config/passport');

var app = express();

mongoose.connect('mongodb://localhost/hellose-opd');

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ cookie: { maxAge: 60000 }, secret: 'SECRET', resave: true,
    saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Passport
app.use(passport.initialize());
app.use(passport.session());


//Routers
var main_routes = require('./routes/ctrl-main');
var records_routes = require('./routes/ctrl-records');
var patients_routes = require('./routes/ctrl-patients');
var diseases_routes = require('./routes/ctrl-diseases');

var appointment_routes = require('./routes/ctrl-appointment');

var prescriptions_routes = require('./routes/ctrl-prescriptions');
var medicines_routes = require('./routes/ctrl-medicines');


app.use('/', main_routes);
app.use('/records', records_routes);
app.use('/patients', patients_routes);
app.use('/diseases', diseases_routes);
app.use('/appointment', appointment_routes);
app.use('/prescriptions', prescriptions_routes);
app.use('/medicines', medicines_routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
