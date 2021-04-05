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
      "userType":data.user_type
    }
		data.token =  jwt.sign(payload,'my_secret_key',{ expiresIn: 60*60*24*30 });
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

const userForgotPassword = async (req,res,next)=>{
  logger.debug("inside userFogotPassword controller");
  let userData = req.body;
  if(userData.password){
    const salt = await bcrypt.genSaltSync(10);
    const hashPassword = await bcrypt.hashSync(userData.password, salt);
    userData.password = hashPassword;
    logger.debug(userData);
  }
  userService.userForgotPassword(userData).then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
}

const getUserList = (req,res,next)=>{
  logger.debug("inside getUserList controller");
  let condition = {};
  if(req.query.userType){
    let user_type = req.query.userType
    if(user_type && (user_type == 2 || user_type == 1)){
      condition.user_type = user_type;
    }
    else{
      return res.json({"success":false,"message":"no such user type exist"});
    }
  }
  userService.getUserList(condition).then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
  
}

const deleteUser = (req,res,next)=>{
  logger.debug("inside deleteUser controller");
  let id = parseInt(req.params.id);
    let condition = {id:id};
    userService.deleteUser(condition).then(data=>{
      return res.json({"success":true, "message":data});
    }).catch(err=>{
      return res.json({"success":false,"message":err});
    });
}

const updateUser = async (req,res,next)=>{
  logger.debug("inside update user controller");
  let id = req.params.id;
  let userData = JSON.parse(JSON.stringify(req.body));
    logger.debug(userData,"userData");
    if(userData.password){
      const salt = await bcrypt.genSaltSync(10);
      const hashPassword = await bcrypt.hashSync(userData.password, salt);
      userData.password = hashPassword;
      userData.newPassword = req.body.password;
      logger.debug(userData);
    }
    userService.updateUser(userData,id).then(data=>{
      return res.json({"success":true, "message":data});
    }).catch(err=>{
      return res.json({"success":false,"message":err});
    });
}

const dashboard = async (req,res,next)=>{
  logger.debug("inside user dashboard controller");
  userService.dashboard().then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  });
}

const getBusyExecutive= async (req,res,next)=>{
  logger.debug("inside get busy executive controller");
  let date = req.query.date;
  let startTime = req.query.startTime;
  let endTime = req.query.endTime;
  let searchQuery = req.query.searchQuery;
  userService.getExecutiveList(date,startTime,endTime,searchQuery).then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false,"message":err});
  })
}

const userListOfSlot = (req,res,next)=>{
  logger.debug("inside userListOfSlot controller");
  let slotId = req.params.slotId;
  userService.userListOfSlot(slotId).then(data=>{
    return res.json({"success":true, "data":data});
  }).catch(err=>{
    return res.json({"success":false, "message":err});
  });
}

module.exports = {
  userLogin,
  addUser,
  userForgotPassword,
  getUserList,
  deleteUser,
  updateUser,
  dashboard,
  getBusyExecutive,
  userListOfSlot
};