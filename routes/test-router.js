var express = require('express');
var router = express.Router();

module.exports = router;

router.get('/', function(req, res, next) {
  res.render('material/home');
});

router.get('/profile', function(req, res, next) {
  res.render('material/view_profile');
});

