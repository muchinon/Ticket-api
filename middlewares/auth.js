import jwt from "jsonwebtoken";
import { UserModel } from "../models/user_model.js";

export const isAuthenticated = (req, res, next) => {
  try {
    //Check if session has user
    if (req.session.user) {
      next();
    } else if (req.headers.authorization) {
      try {
        //Extract token from headers
        const token = req.headers.authorization.split(" ")[1];

        //Verify the token to get user and append to request
        req.user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        //call next function
        next();
      } catch (error) {
        return res.status(401).json({ error: "Token Expired" });
      }
    } else {
      res.status(401).json("User not authenticated");
    }
  } catch (error) {
    next(error);
  }
};
