const logger = require('../../config/logger');
const models = require('../../models');
const Op = models.Sequelize.Op;
const bcrypt = require('bcrypt');
const { sequelize, Sequelize } = require('../../models');
const { reject } = require('bcrypt/promises');


const findUserByID = (condition)=>{
  logger.debug("inside find user by id",condition);
  return new Promise((resolve,reject)=>{
    models.users.findOne({where:condition},{raw:true})
    .then((data)=>{
      if(data){
        logger.debug(data)
        resolve(data);
      }
      else{
        reject("user Not Found")
      }
    })
    .catch(err=>reject("db error"));
  });
}

const isUserExist = (data)=>{
  logger.debug("inside is user exist");
  return new Promise(async (resolve,reject)=>{
    let condition = {
      email:data.email,
    }
    let userData = await models.users.findOne({attributes:['email'],where:condition});
      if(userData){
        resolve(true);
      }
      else{
        resolve(false);
      }
  });
}

const userLogin = (userCreds)=>{
  logger.debug("inside user login",{userCreds});
  return new Promise(async (resolve,reject)=>{
    let condition = {
      email:userCreds.email,
    }
    let userData = await models.users.findOne({
      where:condition,
      attributes:['id','firstName','lastName','email','password'],
      raw:true
    })

    if(userData){
      if(userData && bcrypt.compareSync(userCreds.password, userData.password)){
        delete userData.password;
        resolve(userData);
      }
      else{
        reject("Invalid Password");
      }
    }
    else{
      reject("Invalid Email ID");
    }
  });
};


const addUser = (userData)=>{
  return new Promise(async (resolve,reject)=>{
    logger.debug("inside add user service",{userData});
    try{
      if(!await isUserExist(userData)){
        let newUser = await models.users.create(userData);
        userData.id = newUser.dataValues.id;
        await addOrganization(userData);
        resolve("data inserted successfully");
      }
      else{
        reject("user allready exist...!!!");
      }
    }
    catch(err){
      reject(err);
    }
  });
};

const addOrganization = (addedUserOrgData)=>{
  return new Promise(async (resolve,reject)=>{
    logger.debug('inside add organization',addedUserOrgData);
    let orgData = addedUserOrgData;
    let dataSet = {userId:orgData.id,organizationName:orgData.organizationName,employeeId:orgData.employeeId};
    await models.employees.create(dataSet);
    resolve();
  })
}

const userForgotPassword = (userData)=>{
  console.log("inside user userpassword forget");
  return new Promise((resolve,reject)=>{
    isUserExist(userData)
    .then(()=>{
      console.log("data found updating ....");
      models.users.update({password:userData.newPassword},{where:{email:userData.email}})
      .then(resolve("password reset"))
      .catch(err=>reject(err))
    })
    .catch(err=>reject(err));
  });
};


const getUserList = (condition)=>{
  logger.debug("inside get user list",condition);
  return new Promise((resolve,reject)=>{
    models.users.findAll({
      attributes:['id','firstName','lastName','email',
      // [sequelize.col('employees.organizationName'),'organizationName']
      // [sequelize.col('employees.employeeId'),'employeeId']    
    ],
      include:[{
        model:models.employees,
        attributes:['organizationName','employeeId'],
      }],
      where:condition,
      order:[['id','DESC']],
      raw:true
    })
    .then( async data=>{
      if(data){
        resolve(data);
      }
      else{
        reject("no User exist");
      }
    })
    .catch(err=>reject(err));
  });
};


const deleteUser = (condition)=>{
  console.log("inside delete User data");
  return new Promise((resolve,reject)=>{
    models.users.destroy({where:condition})
    .then(resolve("user details deleted"))
    .catch(err=>reject(err))
  })
};


const updateUser = (userData,id)=>{
  console.log("inside updatedevice data");
  return new Promise((resolve,reject)=>{
    let condition = {
      id:id
    }
    let dataSet = userData;
    logger.debug(dataSet,condition);
    findUserByID(condition)
    .then((data)=>{
      if(dataSet.password && data.password && bcrypt.compareSync(dataSet.newPassword, data.password)){
        return reject("please enter new password");
      }
      models.users.update(dataSet,{where:condition})
      .then(resolve("user details updated"))
      .catch(err=>reject(err))
    })
    .catch(err=>reject(err));
  });
};

module.exports = {
  userLogin,
  addUser,
  userForgotPassword,
  getUserList,
  deleteUser,
  updateUser,
};
