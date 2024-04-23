const express = require('express')
const router = express.Router();
const commonController = require('../controller/common/commonController.js')

router.post('/createProfile', commonController.verifyToken, commonController.uploadImg, commonController.createProfile);
router.post('/createPaymentMethod', commonController.verifyToken, commonController.savePaymentMethod);
router.post('/createPayment', commonController.verifyToken, commonController.createStripePayment);
router.post('/createProfileWithAuth', commonController.verifyToken, commonController.uploadImg,commonController.createProfileWithAuth);
router.post('/getUserSummary', commonController.verifyToken, commonController.getUserSummary);
router.post('/createPayment',  commonController.createPayment);
router.post('/demo',  commonController.demo);
router.post('/chargePayment', commonController.verifyToken, commonController.chargePayment);
router.post('/savePaymentStatus',commonController.verifyToken,commonController.savePaymentStatus);
router.get('/getTransactionDetails',commonController.verifyToken,  commonController.getTransactionDetails);
router.get('/getProfile', commonController.verifyToken, commonController.getUserProfileData);
router.post('/createTrip', commonController.verifyToken, commonController.createTrip);
router.post('/getTrips',commonController.verifyToken,commonController.getAllTrip);
router.post('/getNotifications',commonController.verifyToken,commonController.getAllNotification);
router.post('/getTripLocations',commonController.verifyToken,commonController.getTripLocations);
router.post('/checkProfileStatus',commonController.verifyToken,commonController.checkUserProfileExist);
router.post('/checkBackgroundAuthStatus',commonController.verifyToken,commonController.checkBackgroundAuthExist);

router.post('/addCSVFile', commonController.addVehicles);
router.get('/findvehiclemakeid', commonController.findvehiclemakeid);
router.post('/findvechilemodel', commonController.findvechilemodel);
router.post('/findvechilemodelyear', commonController.findvechilemodelyear);
//router.post('/resetPassword',commonController.verifyToken, commonController.resetPassword);
router.post('/logout',commonController.verifyToken, commonController.logout);
router.post('/editProfile',commonController.verifyToken,commonController.uploadImg1, commonController.editProfile);
router.post('/changePassword',commonController.verifyToken, commonController.changePassword);
router.post('/resetPassword',commonController.verifyToken, commonController.resetPassword);
router.post('/createDestinationContact',commonController.verifyToken, commonController.createDestinationContact);
router.post('/createFaq', commonController.createFaq);
router.get('/getFaqs', commonController.getFaqs);
router.post('/deleteAccount',commonController.verifyToken,commonController.deleteAccount);
router.post('/getPastTrip', commonController.getPastTrip);
//router.post('/privacyPolicy', commonController.privacyPolicy);
//router.get('/getprivacyPolicy', commonController.getprivacyPolicy);
router.get('/getAllStates', commonController.getAllStates)
router.get('/getAllInstitutes', commonController.getAllInstitutes)
router.get('/total',commonController.verifyToken, commonController.getTotalData)
router.get('/month-wise',commonController.verifyToken, commonController.getUsersByMonths)
router.get('/month-growth',commonController.verifyToken, commonController.getPieChartsDetails)





module.exports = router;