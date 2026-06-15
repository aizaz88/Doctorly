import mongoose, { mongo } from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, require: true },
  slotDate: { type: String, require: true },
  slotTime: { type: String, require: true },
  userData: { type: Object, require: true },
  docData: { type: Object, require: true },
  amount: { type: Number, require: true },
  date: { type: Number, require: true },
  cancelled: { type: Number, require: true },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  paymentIntentId: { type: String, default: null },
  paymentDate: { type: Date, default: null },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
