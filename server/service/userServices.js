const logger = require('../../config/logger');
const models = require('../../models');
const Op = models.Sequelize.Op;
const bcrypt = require('bcrypt');
const { sequelize, Sequelize } = require('../../models');


const findUserByID = (condition)=>{
  logger.debug("inside find user by id",condition);
  return new Promise((resolve,reject)=>{
    models.user_details.findOne({where:condition},{raw:true})
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
  return new Promise((resolve,reject)=>{
    let condition = {
      email:data.email,
    }
    models.user_details.findOne({where:condition})
    .then(data=>{
      if(data){
        resolve("Email ID exist");
      }
      else{
        reject("Email ID not exist");
      }
    })
    .catch(err=>reject(err));
  });
}

const userLogin = (userData)=>{
  console.log("inside user login");
  return new Promise((resolve,reject)=>{
    let condition = {
      email:userData.email,
    }
    models.user_details.findOne({
      where:condition,
      attributes:['id','first_name','last_name','email','password','mobile_no','address','user_type'],
      raw:true
    })
    .then(data=>{
//      if(data.user_type != 1){
  //      reject("User access denied");
    //  }
      if(data){
        if(data && userData.deviceType == 1 && data.user_type == 2){
          return reject("user have no access");
        }
        if(data && bcrypt.compareSync(userData.password, data.password)){
          delete data.password;
          resolve(data);
        }
        else{
          reject("Invalid Password");
        }
      }
      else{
        reject("Invalid Email ID");
      }
      
    })
    .catch(err=>reject("Invalid Email ID"));
  });
};


const addUser = (userData)=>{
  console.log("inside add user");
  return new Promise((resolve,reject)=>{
    isUserExist(userData)
    .then(()=>reject("Email Id Exist"))
    .catch(()=>{
      logger.debug("adding user",userData);
      let newUser = {
        first_name: userData.first_name,
        last_name:userData.last_name,
        email:userData.email,
        address:userData.address,
        password:userData.password,
        country_id:userData.country_id,
        state_id:userData.state_id,
        city_id:userData.city_id,
        mobile_no:userData.mobile_no,
        user_type:userData.user_type,
      }
      models.user_details.create(newUser).then((data)=>{
        logger.debug("added userData :",data);
        resolve("data inserted successfully");
      })
      .catch(err => reject(err));
    })
  });
};


const userForgotPassword = (userData)=>{
  console.log("inside user userpassword forget");
  return new Promise((resolve,reject)=>{
    isUserExist(userData)
    .then(()=>{
      console.log("data found updating ....");
      models.user_details.update({password:userData.newPassword},{where:{email:userData.email}})
      .then(resolve("password reset"))
      .catch(err=>reject(err))
    })
    .catch(err=>reject(err));
  });
};


const getUserList = (condition)=>{
  logger.debug("inside get user list",condition);
  return new Promise((resolve,reject)=>{
    models.user_details.findAll({
      attributes:['id','first_name','last_name','email','mobile_no','address','state_id','city_id','user_type'],
      include:[{
        model:models.cities,
        attributes:['name'],
      },
      {
        model:models.states,
        attributes:['name'],
      }],
      where:condition,
      order:[['id','DESC']],
      raw:true
    })
    .then( async data=>{
      if(data){
        let finaldata = await data.map(async (user)=>{
          user.cityName = user['city.name'];
          delete user['city.name'];
          user.stateName = user['state.name'];
          delete user['state.name'];
        })
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
    models.user_details.destroy({where:condition})
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
      models.user_details.update(dataSet,{where:condition})
      .then(resolve("user details updated"))
      .catch(err=>reject(err))
    })
    .catch(err=>reject(err));
  });
};

const dashboard = () =>{
  console.log("inside dashboard data service");
  return new Promise((resolve,reject)=>{
    qry = `SELECT COUNT(id) as examCenters, 
    (SELECT COUNT(id) FROM students) as totalStudent,
    (SELECT COUNT(id) FROM user_details where user_type = 1) as totalAdmin,
    (SELECT COUNT(id) FROM user_details where user_type = 2) as totalExecutive,
    (SELECT COUNT(id) FROM students where biometricData != NULL) as totalStudentAttendExam,   
    (SELECT COUNT(id) FROM device_details) as totalDevices, 
    (SELECT COUNT(id) FROM exams) as totalExams,
    (SELECT COUNT(id) FROM students where biometricData != NULL) as dataReceived 
    FROM examCenters`
    sequelize.query(qry)
    .then(data=>{
      logger.debug("dashboard data",data[0]);
      resolve(data[0]);
    })
    .catch(err=>reject(err))
  });
};

const getBusyExecutive = (date,startTime,endTime,searchQuery)=>{
  logger.debug("inside get busy executive service",{date,startTime,endTime,searchQuery});
  return new Promise( async (resolve,reject)=>{
    let equipedSlots = await models.examSlots.findAll({
      attributes:['id',
        [Sequelize.col('slotExecutiveMappings.user_detail.id'), 'userId']
      ],
      where:{
        date:date,
        startTime:{[Op.lte]:endTime},
        endTime:{[Op.gte]:startTime}
      },
      include:[{
        attributes:[],
        model:models.slotExecutiveMapping,
        include:[{
          attributes:[],
          model:models.user_details,
          where:{
            user_type:2,
            [Op.or]: [
              { 
                email:{
                  [Op.like] : searchQuery
                }
              },
              { 
                first_name:{
                  [Op.like] : searchQuery
                }
              }
            ],
          }
        }]
      }],
      raw:true
    });
    let busyExecutiveId = await equipedSlots.map(slots=>slots.userId);
    resolve(busyExecutiveId);
  });
}

const getExecutiveList = (date,startTime,endTime,searchQuery)=>{
  logger.debug("inside get executive service",{date,startTime,endTime,searchQuery});
  return new Promise( async (resolve,reject)=>{
    if(searchQuery.length >= 3){
      searchQuery = "%"+searchQuery+"%";
      let executiveList = await models.user_details.findAll({
        attributes:['id','first_name','last_name','email'],
        where:{
          user_type:2,
          [Op.or]: [
            { 
              email:{
                [Op.like] : searchQuery
              }
            },
            { 
              first_name:{
                [Op.like] : searchQuery
              }
            }
          ],
          
        },
        raw:true
      });
      logger.debug("executiveList",executiveList);
      if(executiveList.length){
        let busyExecutiveId = await getBusyExecutive(date,startTime,endTime,searchQuery);
        logger.debug('busyExecutiveId',busyExecutiveId);
        if(busyExecutiveId[0] != null){
          logger.debug("busy executive found");
          await executiveList.map((element)=> busyExecutiveId.includes(element.id)?element.available=0:element.available=1);
        }
        else{
          logger.debug("no busy executive found");
          await executiveList.map((element)=> element.available=1);
        }
        logger.debug(executiveList);
        resolve(executiveList);
      }
      else{
        reject("no user found");
      }
    }
    else{
      reject("operation cannot be performed !!! qurey must be greater then 3 alphabets");
    }
    
  });
}

const userListOfSlot = (slotId) =>{
  console.log("inside user list of slot service");
  return new Promise((resolve,reject)=>{
    try{
      models.slotExecutiveMapping.findAll({
        attributes:[
          [Sequelize.col('user_detail.id'), 'userId'],
          [Sequelize.col('user_detail.first_name'), 'first_name'],
          [Sequelize.col('user_detail.last_name'), 'last_name'],
          [Sequelize.col('user_detail.email'), 'email'],
        ],
        include:[{
          attributes:[],
          model:models.user_details,
        }],
        where:{slotId:slotId},
        raw:true
      }).then(data=>{
        if(data == null){
          reject("no user found");
        }
        else{
          resolve(data);
        }
      })
      .catch(err=>{
        logger.debug("err",err);
        reject(err);
      })
    }
    catch(err){
      logger.debug(err);
      reject("no user found");
    }
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
  findUserByID,
  getExecutiveList,
  userListOfSlot,
};
