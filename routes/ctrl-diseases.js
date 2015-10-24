var express = require('express');
var router = express.Router();
module.exports = router;

var mongoose = require('mongoose');
var Disease = mongoose.model('Disease');

// Information for each patient
router.get('/listByIdType/:idType', function(req, res, next) {
  console.log(req.body);
  var id_type = req.params.idType;
  Disease.find({ disease_id_type: id_type }, function(err, data)
  {
    if(err) { return next(err); }
    res.json(data);
  }
  );

});
