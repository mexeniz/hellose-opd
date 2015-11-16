// As with any middleware it is quintessential to call next()
// if the user is authenticated
module.exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
  {
  	return next();
  }
  res.redirect('/');
};

module.exports.test = function (req, res, next) {
  console.log('second middleware!');
  return next();
};