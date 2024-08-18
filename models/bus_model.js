import { model, Schema } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const busSchema = new Schema({
  busOperator: { type: String, required: true },
  busLogo: { type: String },
  busType: { type: String, enum: ["Sprinter", "Long bus"], required: true },
  capacity: { type: Number, required: true },
  busNumber: { type: String, required: true },
  date: { type: Date, required: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  ticketPrice: { type: String },
  seats: [
    {
      number: Number,
      isBooked: Boolean,
      userId: { type: Schema.Types.ObjectId, ref: "User" }, // Added userId field
    },
  ],
  operator: { type: Schema.Types.ObjectId, ref: "Operator" },
});

busSchema.plugin(toJSON);

export const BusModel = model("Bus", busSchema);
