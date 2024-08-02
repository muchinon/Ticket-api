import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, lowercase: true, unique: true },
    userName: { type: String, lowercase: true, unique: true },
    userType: { type: String, enum: ["vendor", "customer"] },
    phoneNumber: { type: String, unique: true },
    password: { type: String },
    resetToken: { type: String },
    resetTokenExpiresAt: { type: Date },
    bookings: [{ type: Types.ObjectId, ref: "Booking" }],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);

export const UserModel = model("User", userSchema);
