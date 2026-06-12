import express from "express";
import {
  addDoctor,
  adminLogin,
  allDoctors,
  updateAvailability,
  appointmentAdmin,
  appointmentCancel,
  adminDashboard,
} from "../controller/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", adminLogin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/update-availability", authAdmin, updateAvailability);
adminRouter.get("/appointments", authAdmin, appointmentAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
export default adminRouter;
