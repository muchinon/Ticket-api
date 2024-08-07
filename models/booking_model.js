import { model, Schema } from "mongoose";

const bookingSchema = new Schema({
  paymentMethod: { type: String, enum: ["momo", "visa"], required: true },
  dependants: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true },
    },
  ],
  guest: {
    name: { type: String },
    email: { type: String },
  },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  bus: { type: Schema.Types.ObjectId, ref: "Bus" },
});

export const BookingModel = model("Booking", bookingSchema);
