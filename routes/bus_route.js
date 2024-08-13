import { Router } from "express";
import { getAllBuses } from "../controllers/operator_controller.js";
import { getBusDetails, getBusSeats } from "../controllers/bus_controller.js";

export const busRouter = Router();

busRouter.get("/api/buses", getAllBuses);

busRouter.get("/api/buses/:busId", getBusDetails);

busRouter.get("/api/buses/:busId/seats", getBusSeats);
