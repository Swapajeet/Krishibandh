const Joi = require('joi');

module.exports.orderSchema = Joi.object({
    order : Joi.object({
          companyName: Joi.string().required(),
          cropName:Joi.string().required(),
          quantity:Joi.number().required(),
          price:Joi.number().required().min(0),
          description:Joi.string().required(),
          address:Joi.string().required(),
    }).required()
});
