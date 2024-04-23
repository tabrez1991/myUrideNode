const express = require('express')
const router = express.Router();
const riderController = require('../controller/user/rider/riderController.js')
const driverController = require('../controller/user/driver/driverController.js')

// rider controller routes
router.get('/findDrivers', riderController.verifyToken, riderController.findDrivers);
router.get('/findDrivers1', riderController.verifyToken, riderController.findDrivers1);
router.get('/getDriverDetails',  riderController.verifyToken, riderController.getDriverDetailsByID);
router.get('/getDriverDetailsByIDDemo',  riderController.verifyToken, riderController.getDriverDetailsByIDDemo);
router.post('/sendOfferToDriver', riderController.verifyToken, riderController.sendOfferToDriver);
router.post('/confirmRideSentByDriver', riderController.verifyToken, riderController.confirmRideSentByDriver);
router.get('/getActiveDrivers', riderController.verifyToken, riderController.getActiveDrivers);
router.get('/getNewRequest', riderController.verifyToken, riderController.getNewRequest);  
router.get('/getDetailToConfirmRide', riderController.verifyToken, riderController.getDriverDetailToConfirmRide);
router.get('/getAllRideWithOfferStatus', riderController.verifyToken, riderController.getAllRideWithStatus);
router.post('/cancelDriverOffer', riderController.verifyToken, riderController.cancelDriverOffer);
router.post('/rateDriver', riderController.verifyToken, riderController.rateDriver);
router.post('/sendNewOfferPriceToDriver', riderController.verifyToken, riderController.sendNewOfferPriceToDriver);
router.get('/getAllDriverTripOfferdetail', riderController.verifyToken, riderController.getAllDriverTripOfferdetail);
router.get('/getDriverOffersByTripID', riderController.verifyToken, riderController.getDriverOfferByTripId);
router.post('/shareRideDetails', riderController.verifyToken, riderController.shareRideDetails);
router.post('/requestExpiration',  riderController.requestExpiration);
router.post('/pushNotifications', riderController.pushNotifications);
router.post('/submit-feedback', riderController.verifyToken, riderController.submitFeedback);
router.get('/riders-list', riderController.verifyToken, riderController.getRidersList);
router.post('/add-rider', riderController.verifyToken, riderController.addRider);





//router.get('/getriderofferstodriver', riderController.verifyToken, riderController.getriderofferstodriver);


// driver controller routes
router.get('/findRiders', driverController.verifyToken, driverController.findRiders);
router.post('/sendOfferToRider', driverController.verifyToken, driverController.sendOfferToRider);
router.get('/getOffersByTripID', driverController.verifyToken, driverController.getRiderOfferByTripId);
router.get('/getUpcomingTrips', driverController.verifyToken, driverController.getUpcomingTrips);
router.post('/deleteTrip', driverController.verifyToken, driverController.deleteTrip);
router.post('/acceptRiderOffer', driverController.verifyToken, driverController.acceptRiderOffer);
router.post('/rejectRiderOffer', driverController.verifyToken, driverController.rejectRiderOffer);
router.get('/getNewRideRequest', driverController.verifyToken, driverController.getNewRideRequest);
router.get('/getActiveRiders', driverController.verifyToken, driverController.getActiveRiders);
router.get('/getAllRiderOfferDetails', driverController.verifyToken, driverController.getAllRiderTripOfferdetail);
router.get('/getSingleRiderOfferDetails', driverController.verifyToken, driverController.getSingleRiderTripOfferdetail);
router.get('/getRiderTripDetails', driverController.verifyToken, driverController.getSingleRiderTripdetail);
router.get('/getNewRequestInArea', driverController.verifyToken, driverController.getNewRiderRequestInArea);
router.get('/getRideTotalDistance', driverController.verifyToken, driverController.getRideTotalDistance);
router.post('/startTrip', driverController.verifyToken, driverController.startTrip);
router.post('/finishRide', driverController.verifyToken, driverController.finishRide);
router.post('/rateRiders', driverController.verifyToken, driverController.rateRiders);
router.get('/getCarDetails', driverController.verifyToken, driverController.getCarDetails);
router.post('/getActiveTripStatus', driverController.verifyToken, driverController.getActiveTripStatus);
router.get('/drivers-list', driverController.verifyToken, driverController.getDriversList);
router.post('/add-driver', driverController.verifyToken, driverController.addDriver);
router.post('/edit-driver', driverController.verifyToken, driverController.updateDriver);
router.post('/delete-driver', driverController.verifyToken, driverController.deleteDriver);
router.post('/activate-driver', driverController.verifyToken, driverController.activateDriver);
router.post('/complete-background-check', driverController.verifyToken, driverController.completeBackgroundCheck);






module.exports = router;