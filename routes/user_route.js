import { Router } from "express";
import {
  forgotPassword,
  resetPassword,
  signUp,
  token,
  verifyResetToken,
} from "../controllers/user_controller.js";

export const userRouter = Router();

userRouter.post("/api/auth/users/register", signUp);

userRouter.post("/api/auth/users/login", token);

userRouter.post("/api/auth/users/forgot-password", forgotPassword);

userRouter.post("/api/auth/users/reset-token/:id", verifyResetToken);

userRouter.post("/api/auth/users/reset-password", resetPassword);
