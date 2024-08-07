import Joi from "joi";

export const bookingSchema = Joi.object({
  paymentMethod: Joi.string().valid("momo", "visa"),

  dependants: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      age: Joi.number(),
    })
  ),

  guest: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
  }),
});
