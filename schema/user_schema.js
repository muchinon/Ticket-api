import Joi from "joi";

export const userSchema = Joi.object({
  firstName: Joi.string().required().max(255),

  lastName: Joi.string().required().max(255),

  email: Joi.string().lowercase().email().required(),

  userName: Joi.string().required(),

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

export const createUserSchema = Joi.object({
  firstName: Joi.string().required().max(255),

  lastName: Joi.string().required().max(255),

  email: Joi.string().lowercase().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(/[0-9]/)
    .message(
      "Password must be at least 8 characters long and include at least one number."
    )
    .required(),

  role: Joi.string().required().valid("admin", "manager"),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().lowercase().email().required(),
});

export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});
