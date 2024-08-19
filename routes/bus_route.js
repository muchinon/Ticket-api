import { Router } from "express";
import {
  getAllBuses,
  getBusDetails,
  getBusSeats,
  searchBuses,
} from "../controllers/bus_controller.js";

export const busRouter = Router();

busRouter.get("/api/buses", getAllBuses);

busRouter.get("/api/buses/search", searchBuses);

busRouter.get("/api/buses/:busId", getBusDetails);

busRouter.get("/api/buses/:busId/seats", getBusSeats);
