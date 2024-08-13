import Joi from "joi";

export const bookingSchema = Joi.object({
  paymentMethod: Joi.string().valid("momo", "visa").required(),
  dependants: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      age: Joi.number().required(),
    })
  ),
  guest: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
  }),
  bus: Joi.string().required(),
  seat: Joi.number().required(), // Add seat validation
});
