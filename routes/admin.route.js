const express = require('express')
const router = express.Router();
const adminController = require('../controller/admin/adminController.js')


// rider controller routes
router.post('/register', adminController.create);
router.post('/login', adminController.login);
router.post('/reset-password', adminController.resetPassword);
router.get('/:id', adminController.verifyToken, adminController.getUserById);
router.get('/', adminController.verifyToken, adminController.getUsers);
router.post('/add-user', adminController.verifyToken, adminController.uploadImg1, adminController.addUser);
router.post('/edit-user', adminController.verifyToken, adminController.uploadImg1, adminController.updateUser);
router.post('/delete-user', adminController.verifyToken, adminController.deleteUser);
router.post('/activate-user', adminController.verifyToken, adminController.activateUser);
router.post('/logout', adminController.verifyToken, adminController.logoutUser);



module.exports = router;