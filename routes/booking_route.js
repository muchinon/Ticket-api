import { Router } from "express";
import { addBooking } from "../controllers/booking_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export const bookingRouter = Router();

bookingRouter.post("/users/bookings", isAuthenticated, addBooking);
