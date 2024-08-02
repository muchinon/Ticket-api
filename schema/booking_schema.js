import Joi from "joi";

export const bookingSchema = Joi.object({
  departureCity: Joi.string().required().max(255),

  arrivalCity: Joi.string().required().max(255),

  departureTime: Joi.string().required().max(255),

  arrivalTime: Joi.string().required().max(255),

  date: Joi.date(),

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
