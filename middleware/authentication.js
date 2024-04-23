require('dotenv').config()
const jwt = require('jsonwebtoken');
const {errorResponse} = require('../helpers/apiResponse.js')

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return errorResponse(res, 'A token is required for authentication')
  }
  try {
    console.log("process.env.SECRET_KEY,token",process.env.SECRET_KEY,token);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    
     return errorResponse(res, 'Invalid  or Expired')
  }
  return next();

};

module.exports = verifyToken;
