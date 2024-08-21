import { ResetTokenModel, UserModel } from "../models/user_model.js";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userSchema,
} from "../schema/user_schema.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import { transporter } from "../config/mail.js";

export const signUp = async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    //   Checking if user is already in database
    const email = value.email;

    const findIfUserExist = await UserModel.findOne({ email });
    if (findIfUserExist) {
      return res.status(401).send("User is already registered");
    } else {
      const hashedPassword = bcrypt.hashSync(value.password, 12);
      value.password = hashedPassword;

      const addUser = await UserModel.create(value);

      // Send email to user
      await transporter.sendMail({
        to: value.email,
        subject: "User Account Created",
        text: `Dear user, \n\n A user account has been created with the following credentials. \n Email: ${value.email} \n\nThank you`,
      });
      return res.status(201).send("User registered successfully");
    }
  } catch (error) {
    next(error);
  }
};

// Session login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //Find a user using their unique identifier
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      res.status(401).json("Invalid email or password");
    } else {
      //Verify their password
      const correctPassword = bcrypt.compareSync(password, user.password);
      if (!correctPassword) {
        res.status(401).json("Invalid email or password");
      } else {
        //Generate a session
        req.session.user = { id: user.id };
        console.log("user", req.session.user);
        // Return response
        res.status(200).json("Login successful");
      }
    }
  } catch (error) {
    next(error);
  }
};

// Token login
// export const token = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     //Find a user using their unique identifier
//     const user = await UserModel.findOne({ email: email });
//     if (!user) {
//       res.status(401).json("Invalid email or password");
//     } else {
//       //Verify their password
//       const correctPassword = bcrypt.compareSync(password, user.password);
//       if (!correctPassword) {
//         res.status(401).json("Invalid email or password");
//       } else {
//         //Generate a token
//         const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, {
//           expiresIn: "5h",
//         });

//         res.status(200).json({
//           message: "Login successful",
//           accessToken: token,
//           user: {
//             firstName: user.firstName,
//             lastName: user.lastName,
//             username: user.userName,
//             userId: user.id,
//             email: user.email,
//           },
//         });
//       }
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const token = async (req, res, next) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verify ReCAPTCHA token
    const recaptchaRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    if (!recaptchaRes.data.success) {
      return res.status(400).json({ message: "ReCAPTCHA verification failed" });
    }

    // Find a user using their unique identifier
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      res.status(401).json("Invalid email or password");
    } else {
      // Verify their password
      const correctPassword = bcrypt.compareSync(password, user.password);
      if (!correctPassword) {
        res.status(401).json("Invalid email or password");
      } else {
        // Generate a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, {
          expiresIn: "5h",
        });

        res.status(200).json({
          message: "Login successful",
          accessToken: token,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            userId: user.id,
            email: user.email,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(422).json(error);
    }

    const user = await UserModel.findOne({ email: value.email });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const resetToken = await ResetTokenModel.create({ userId: user.id });

    await transporter.sendMail({
      to: value.email,
      subject: "Reset Your Password",
      html: `
              <h1>Hello ${user.firstName}</h1>
              <h3>Please follow the link below to reset your password.</h3>
              <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken.id}">Click Here</a>
              `,
    });

    res.status(200).json("Password Reset Mail Sent");
  } catch (error) {
    next(error);
  }
};

export const verifyResetToken = async (req, res, next) => {
  try {
    // Find Reset Token by id
    const resetToken = await ResetTokenModel.findById(req.params.id);
    if (!resetToken) {
      return res.status(404).json("Reset Token Not Found");
    }
    // Check if token is valid
    if (
      resetToken.expired ||
      Date.now() >= new Date(resetToken.expiresAt).valueOf()
    ) {
      return res.status(409).json("Invalid Reset Token");
    }
    // Return response
    res.status(200).json("Reset Token is Valid!");
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { value, error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(422).json(error);
  }

  const resetToken = await ResetTokenModel.findById(value.resetToken);
  if (!resetToken) {
    return res.status(404).json("Reset Token Not Found");
  }

  // Check if token is valid
  if (
    resetToken.expired ||
    Date.now() >= new Date(resetToken.expiresAt).valueOf()
  ) {
    return res.status(409).json("Invalid Reset Token");
  }

  // Encrypt new password
  const hashedPassword = bcrypt.hashSync(value.password, 10);

  // Update new password
  await UserModel.findByIdAndUpdate(resetToken.userId, {
    password: hashedPassword,
  });

  // Make reset token expired
  await ResetTokenModel.findByIdAndUpdate(value.resetToken, { expired: true });

  res.status(200).json("Password Reset Successfully");
};

export const createUser = async (req, res, next) => {
  try {
    const { value, error } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(422).json(error);
    }

    // Encrypt password
    const hashedPassword = bcrypt.hashSync(value.password, 10);

    await UserModel.create({
      ...value,
      password: hashedPassword,
    });

    // Send email to user
    await transporter.sendMail({
      to: value.email,
      subject: "User Account Created",
      text: `Dear user, \n\n A user account has been created for you with the following credentials. \n\n Username: ${value.username} \n Email: ${value.email} \n\nThank you`,
      // text: `Dear user, \n\n A user account has been created for you with the following credentials. \n\n Username: ${value.username} \n Email: ${value.email} \nPassword: ${value.password}\nRole: ${value.role}\n\nThank you`,
    });

    res.status(201).json("User Created");
  } catch (error) {
    next(error);
  }
};

export const getAUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
