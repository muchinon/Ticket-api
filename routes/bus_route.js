import { Router } from "express";
import { getAllBuses } from "../controllers/operator_controller.js";

export const busRouter = Router();

busRouter.get("/buses", getAllBuses);
