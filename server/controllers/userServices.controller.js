const logger = require('../../config/logger');
const userService = require('../service/userServices');
const jwt = require('jsonwebtoken');
const models = require('../../models');
const Op = models.Sequelize.Op;
const bcrypt = require('bcrypt');


var getCurrentTime = function(){
  var currTime =  new Date()//.toISOString();
  var month  = currTime.getMonth() + 1;
  currTime = currTime.getFullYear()+ '-' +month+ '-' +currTime.getDate()+' '+currTime.getHours()+':'+currTime.getMinutes()+':'+currTime.getSeconds();
  return currTime;
}

const userLogin = (req,res,next)=>{
  logger.debug("inside userLogin controller");
  var userData = req.body;
  userService.userLogin(userData)
  .then(data=>{
    logger.debug("data found",data);
    let payload = {
      "email" : data.email,
      "id":data.id,
    }
    data.token =  jwt.sign(payload,'my_secret_key',{ expiresIn: 60*60*24*30 });
    models.users.update({sessionKey:data.token},{where:{email:data.email}});
		logger.debug("Response from model: " + JSON.stringify(data));
    res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
}

const addUser = async (req,res,next)=>{
  logger.debug("inside addUser controller");
  let userData = req.body;
  const salt = await bcrypt.genSaltSync(10);
  const hashPassword = await bcrypt.hashSync(userData.password, salt);
  userData.password = hashPassword;
  logger.debug(userData);
  userService.addUser(userData).then(data=>{
    return res.json({"success":true,"message":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
  
}

const getUserList = (req,res,next)=>{
  logger.debug("inside getUserList controller");
  let condition = {};
  userService.getUserList(condition).then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
  
}



module.exports = {
  userLogin,
  addUser,
  getUserList,
};