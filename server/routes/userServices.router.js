const express = require('express');
const validate = require('express-validation');
// const activityLogger = require('../middlewares/activityLogger')
const controller = require('../controllers/userServices.controller');
const {login,addUser} = require('../validations/userServices.validation');
const router = express.Router();
const checkToken = require('../middlewares/secureRoutes')


router.route('/login').post(validate(login),controller.userLogin);
router.route('/addUser').post(validate(addUser),controller.addUser);
router.route('/getUserList').get(checkToken,controller.getUserList);



module.exports = router;
