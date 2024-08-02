import { model, Schema } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const busSchema = new Schema({
  busOperator: { type: String, required: true },
  capacity: { type: Number, required: true },
  busNumber: { type: String, required: true },
});

busSchema.plugin(toJSON);

export const BusModel = model("Bus", busSchema);
