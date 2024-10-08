import Joi from "joi";

export const busSchema = Joi.object({
  busOperator: Joi.string().required().max(255),

  busLogo: Joi.string(),

  busType: Joi.string().valid("Sprinter", "Long bus"),

  capacity: Joi.number().required(),

  busNumber: Joi.string().required().max(255),

  date: Joi.date(),

  departureCity: Joi.string().required().max(255),

  arrivalCity: Joi.string().required().max(255),

  departureTime: Joi.string().required().max(255),

  arrivalTime: Joi.string().required().max(255),

  ticketPrice: Joi.string().required().max(255),

  discount: Joi.string().valid("10%", "20%"),

  seats: Joi.array().items(
    Joi.object({
      number: Joi.number(),
      isBooked: Joi.boolean(),
    })
  ),
});
