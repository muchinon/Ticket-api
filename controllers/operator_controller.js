import { transporter } from "../config/mail.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BusModel } from "../models/bus_model.js";
import { ResetTokenModel, UserModel } from "../models/user_model.js";
import { busSchema } from "../schema/bus_schema.js";
import { operatorSchema } from "../schema/operator_schema.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schema/user_schema.js";
import { OperatorModel } from "../models/operator_model.js";

export const signUp = async (req, res, next) => {
  try {
    const { error, value } = operatorSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    //   Checking if user is already in database
    const email = value.email;

    const findIfUserExist = await OperatorModel.findOne({ email });
    if (findIfUserExist) {
      return res.status(401).send("User is already registered");
    } else {
      const hashedPassword = bcrypt.hashSync(value.password, 12);
      value.password = hashedPassword;

      const addUser = await OperatorModel.create(value);
      return res.status(201).send("User registered successfully");
    }
  } catch (error) {
    next(error);
  }
};

// Token login
export const token = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //Find a user using their unique identifier
    const user = await OperatorModel.findOne({ email: email });
    if (!user) {
      res.status(401).json("Invalid email or password");
    } else {
      //Verify their password
      const correctPassword = bcrypt.compareSync(password, user.password);
      if (!correctPassword) {
        res.status(401).json("Invalid email or password");
      } else {
        //Generate a token
        const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATE_KEY, {
          expiresIn: "5h",
        });

        res.status(200).json({
          message: "Login successful",
          accessToken: token,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
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

    const user = await OperatorModel.findOne({ email: value.email });
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
  await OperatorModel.findByIdAndUpdate(resetToken.userId, {
    password: hashedPassword,
  });

  // Make reset token expired
  await ResetTokenModel.findByIdAndUpdate(value.resetToken, { expired: true });

  res.status(200).json("Password Reset Successfully");
};

export const addBus = async (req, res, next) => {
  try {
    const { error, value } = busSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const id = req.session?.user?.id || req?.user?.id;
    console.log(id);
    const user = await OperatorModel.findById(id).populate("buses");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const createBus = await BusModel.create({
      ...value,
      user: id,
    });

    user.buses.push(createBus._id);

    await user.save();

    res.status(201).json({ message: "Bus added" });
  } catch (error) {
    next(error);
  }
};

export const getABus = async (req, res, next) => {
  try {
    const aBus = await BusModel.findById(req.params.id);
    res.status(200).send(aBus);
  } catch (error) {
    next(error);
  }
};

export const getAllBuses = async (req, res, next) => {
  try {
    const allBuses = await BusModel.find();
    res.status(200).send(allBuses);
  } catch (error) {
    next(error);
  }
};

export const updateBus = async (req, res, next) => {
  // const { error, value } = busSchema.validate(req.body);
  // if (error) {
  //   return res.status(400).send(error.details[0].message);
  // }

  const id = req.session?.user?.id || req?.user?.id;
  const user = await OperatorModel.findById(id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const updatedBus = await BusModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedBus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  res.status(201).json({ message: "Bus updated successfully" });
};

export const deleteBus = async (req, res, next) => {
  const id = req.session?.user?.id || req?.user?.id;
  const user = await OperatorModel.findById(id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const deletedBus = await BusModel.findByIdAndDelete(req.params.id);
  if (!deletedBus) {
    return res.status(404).send("Bus not found");
  }

  user.buses.pull(req.params.id);
  await user.save();
  res.status(200).send("Bus has been deleted successfully");
};
