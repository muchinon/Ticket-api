import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema } from "mongoose";

const operatorSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    buses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],
  },
  {
    timestamps: true,
  }
);

operatorSchema.plugin(toJSON);

export const OperatorModel = model("Operator", operatorSchema);
