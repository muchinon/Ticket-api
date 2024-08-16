import { Router } from "express";
import {
  addBooking,
  deleteBooking,
  getABooking,
  getAllBooking,
  updateBooking,
} from "../controllers/booking_controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export const bookingRouter = Router();

bookingRouter.post("/api/users/bookings", isAuthenticated, addBooking);

bookingRouter.get("/api/users/bookings", isAuthenticated, getAllBooking);

bookingRouter.get("/api/users/bookings/:id", isAuthenticated, getABooking);

bookingRouter.patch("/api/users/bookings/:id", isAuthenticated, updateBooking);

bookingRouter.delete("/api/users/bookings/:id", isAuthenticated, deleteBooking);
