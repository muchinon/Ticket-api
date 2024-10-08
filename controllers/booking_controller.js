import { BookingModel } from "../models/booking_model.js";
import { UserModel } from "../models/user_model.js";
import { BusModel } from "../models/bus_model.js";
import { bookingSchema } from "../schema/booking_schema.js";

export const addBooking = async (req, res, next) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const id = req.session?.user?.id || req?.user?.id;
    const user = await UserModel.findById(id).populate("bookings");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const bus = await BusModel.findById(value.bus).populate("operator");
    if (!bus) {
      return res.status(404).send("Bus not found");
    }

    const seatToBook = bus.seats.find((seat) => seat.number === value.seat);
    if (!seatToBook || seatToBook.isBooked) {
      return res.status(400).send("Selected seat is not available");
    }

    // Mark the seat as booked
    seatToBook.isBooked = true;

    const createBooking = await BookingModel.create({
      ...value,
      user: id,
      operator: bus.operator._id, // Set the operator reference
    });

    user.bookings.push(createBooking._id);
    await user.save();
    await bus.save();

    res.status(201).json({ message: "Booking confirmed" });
  } catch (error) {
    next(error);
  }
};

export const getABooking = async (req, res, next) => {
  try {
    const aBooking = await BookingModel.findById(req.params.id);
    res.status(200).send(aBooking);
  } catch (error) {
    next(error);
  }
};

export const getAllBooking = async (req, res, next) => {
  try {
    const allBooking = await BookingModel.find({ bus: req.params.id }).populate(
      { path: "user" }
    );
    res.json(allBooking);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  const { error, value } = bookingSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const id = req.session?.user?.id || req?.user?.id;
  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const updatedBooking = await BookingModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedBooking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.status(201).json({ message: "Booking updated successfully" });
};

export const deleteBooking = async (req, res, next) => {
  const id = req.session?.user?.id || req?.user?.id;
  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).send("User not found");
  }

  const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
  if (!deletedBooking) {
    return res.status(404).send("Booking not found");
  }

  user.bookings.pull(req.params.id);
  await user.save();
  res.status(200).send("Booking has been deleted successfully");
};
