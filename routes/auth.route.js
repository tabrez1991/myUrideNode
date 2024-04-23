const express = require('express')
const router = express.Router();
const authController = require('../controller/authentication/authController.js')
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/validateEmail', authController.validateEmail);
router.post('/validateUsername', authController.validateUsername);
router.get('/verifyEmail', authController.verifyEmail);
router.post('/resendEmailVerification', authController.resendEmailVerification);
router.post('/getStatus', authController.checkEmailVerificationStatus);
router.post('/createRole', authController.createRole);
router.post('/signupdemo', authController.signupdemo);
router.post('/refresh', authController.refreshTokenUser);
router.get('/forgetPassword', authController.forgetPassword);

module.exports = router;