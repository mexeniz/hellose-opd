var express = require('express');
var router = express.Router();
module.exports = router;

var mongoose = require('mongoose');
var Medicine = mongoose.model('Medicine');

// Get all medicine data
router.get('/all', function(req, res, next) {
  Medicine.find(function(err, medicines) {
    // Check if error
    if(err) { return next(err); }
    res.json(medicines);
  });
});
