import Joi from "joi";

export const operatorSchema = Joi.object({
  firstName: Joi.string().required().max(255),

  lastName: Joi.string().required().max(255),

  email: Joi.string().lowercase().email().required(),

  companyName: Joi.string().required().max(255),

  contactNumber: Joi.string()
    .pattern(/^0\d{9}$/)
    .message("Invalid Phone Number"),

  address: Joi.string().required().max(255),

  password: Joi.string()
    .min(8)
    .pattern(/[0-9]/)
    .message(
      "Password must be at least 8 characters long and include at least one number."
    )
    .required(),

  confirmPassword: Joi.ref("password"),
}).with("password", "confirmPassword");
