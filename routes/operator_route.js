import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addBus,
  deleteBus,
  forgotPassword,
  getAllBuses,
  getUser,
  resetPassword,
  signUp,
  token,
  updateBus,
  verifyResetToken,
} from "../controllers/operator_controller.js";
import { getOrders } from "../controllers/payment_controller.js";
import { remoteUpload } from "../middlewares/upload.js";

export const operatorRouter = Router();

// Operator Authentication

operatorRouter.post("/api/auth/operator/register", signUp);

operatorRouter.post("/api/auth/operator/login", token);

operatorRouter.post("/api/auth/operator/forgot-password", forgotPassword);

operatorRouter.post("/api/auth/operator/reset-token/:id", verifyResetToken);

operatorRouter.post("/api/auth/operator/reset-password", resetPassword);

// Operator CRUD operations

operatorRouter.get("/api/operator/:username", isAuthenticated, getUser);

operatorRouter.post(
  "/api/operator/buses",
  remoteUpload.fields([{ name: "busLogo", maxCount: 1 }]),
  isAuthenticated,
  addBus
);

operatorRouter.get("/api/operator/buses/:id", isAuthenticated, getAllBuses);

operatorRouter.patch("/api/operator/buses/:id", isAuthenticated, updateBus);

operatorRouter.delete("/api/operator/buses/:id", isAuthenticated, deleteBus);

// Orders
operatorRouter.get("/api/operator/orders/:id", isAuthenticated, getOrders);
