import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, lowercase: true, unique: true },
    userName: { type: String, lowercase: true, unique: true },
    phoneNumber: { type: String, unique: true },
    password: { type: String },
    bookings: [{ type: Types.ObjectId, ref: "Booking" }],
  },
  {
    timestamps: true,
  }
);

const resetTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    expired: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date().setHours(new Date().getHours() + 2),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);
resetTokenSchema.plugin(toJSON);

export const UserModel = model("User", userSchema);
export const ResetTokenModel = model("ResetToken", resetTokenSchema);
