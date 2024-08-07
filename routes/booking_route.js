import { Router } from "express";
import {
  addBooking,
  deleteBooking,
  getABooking,
  updateBooking,
} from "../controllers/booking_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export const bookingRouter = Router();

bookingRouter.post("/users/bookings", isAuthenticated, addBooking);

bookingRouter.get("/users/bookings/:id", isAuthenticated, getABooking);

bookingRouter.patch("/users/bookings/:id", isAuthenticated, updateBooking);

bookingRouter.delete("/users/bookings/:id", isAuthenticated, deleteBooking);
