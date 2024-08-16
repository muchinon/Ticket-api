import { Router } from "express";
import bodyParser from "body-parser";
import {
  createPayment,
  getOrders,
  handleWebhook,
} from "../controllers/payment_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/api/paystack/create-checkout-session",
  isAuthenticated,
  createPayment
);

paymentRouter.post(
  "/api/paystack/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

paymentRouter.get("/api/paystack/orders", getOrders);
