import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addBus,
  deleteBus,
  forgotPassword,
  getABus,
  resetPassword,
  signUp,
  token,
  updateBus,
  verifyResetToken,
} from "../controllers/operator_controller.js";

export const operatorRouter = Router();

// Operator Authentication

operatorRouter.post("/api/auth/operator/register", signUp);

operatorRouter.post("/api/auth/operator/login", token);

operatorRouter.post("/api/auth/operator/forgot-password", forgotPassword);

operatorRouter.post("/api/auth/operator/reset-token/:id", verifyResetToken);

operatorRouter.post("/api/auth/operator/reset-password", resetPassword);

// Operator CRUD operations

operatorRouter.post("/operator/buses", isAuthenticated, addBus);

operatorRouter.get("/operator/buses/:id", isAuthenticated, getABus);

operatorRouter.patch("/operator/buses/:id", isAuthenticated, updateBus);

operatorRouter.delete("/operator/buses/:id", isAuthenticated, deleteBus);
