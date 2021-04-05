const Joi = require('joi');

module.exports = {
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required().max(128),
    },
  },
  addUser:{
    body: {
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      password: Joi.string().required(),
      country_id:  Joi.required(),
      email:  Joi.string().email().required(),
      mobile_no: Joi.number().required(),
      address:  Joi.string().required(),
      city_id: Joi.required(),
      state_id: Joi.required(),
      user_type: Joi.required(),
    },
  },
  forgotPassword:{
      body: {
        email: Joi.string().email().required(),
        newPassword: Joi.string().required().max(128),
      },
    },
}