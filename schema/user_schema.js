import Joi from "joi";

export const userSchema = Joi.object({
  firstName: Joi.string().required().max(255),

  lastName: Joi.string().required().max(255),

  email: Joi.string().lowercase().email().required(),

  userName: Joi.string().required(),

  userType: Joi.string()
    .valid("vendor", "customer")
    .default("customer")
    .required(),

  phoneNumber: Joi.string()
    .pattern(/^0\d{9}$/)
    .message("Invalid Phone Number"),

  password: Joi.string()
    .min(8)
    .pattern(/[0-9]/)
    .message(
      "Password must be at least 8 characters long and include at least one number."
    )
    .required(),

  confirmPassword: Joi.ref("password"),
}).with("password", "confirmPassword");
