import express from "express";
import {
  listDoctors,
  loginDoctor,
  appointmentsDoctor,
  completeAppointment,
  cancelAppointmentDoctor,
} from "../controller/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", listDoctors);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, completeAppointment);
doctorRouter.post("/cancel-appointment", authDoctor, cancelAppointmentDoctor);

export default doctorRouter;
