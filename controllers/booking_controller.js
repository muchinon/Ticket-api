import { BookingModel } from "../models/booking_model.js";
import { UserModel } from "../models/user_model.js";
import { bookingSchema } from "../schema/booking_schema.js";

export const addBooking = async (req, res, next) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const id = req.session?.user?.id || req?.user?.id;
    console.log(id);
    const user = await UserModel.findById(id).populate("bookings");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const createBooking = await BookingModel.create({
      ...value,
      user: id,
    });

    user.bookings.push(createBooking._id);

    await user.save();

    res.status(201).json({ message: "Booking confirmed" });
  } catch (error) {
    next(error);
  }
};
