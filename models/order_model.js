import { model, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    bus: {
      type: Schema.Types.ObjectId,
      ref: "Bus",
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: "Operator",
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = model("Order", orderSchema);
