const express = require('express');
const validate = require('express-validation');
// const activityLogger = require('../middlewares/activityLogger')
const controller = require('../controllers/userServices.controller');
const {login,addUser,forgotPassword} = require('../validations/userServices.validation');
const router = express.Router();
// const checkToken = require('../middlewares/secureRoutes')


router.route('/login').post(controller.userLogin);
router.route('/addUser').post(validate(addUser),controller.addUser);
router.route('/forgotPassword').put(controller.userForgotPassword);
router.route('/getUserList').get(controller.getUserList);
router.route('/deleteUser/:id').delete(controller.deleteUser);
router.route('/updateUser/:id').put(controller.updateUser);
router.route('/dashboard').get(controller.dashboard);
router.route('/getBusyExecutive').get(controller.getBusyExecutive);
router.route('/userListOfSlot/:slotId').get(controller.userListOfSlot);


module.exports = router;
