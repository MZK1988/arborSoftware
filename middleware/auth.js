const jwt = require('jsonwebtoken');
const config = require('config');

//When user clicks submit or otherwise enters data from the form, then it automatically takes them to the auth route, which is protected
//the user
module.exports = function(req, res, next) {
  //Get token from the header
  const token = req.header('x-auth-token');
  //Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  //Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
