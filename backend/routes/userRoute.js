import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  bookAppointment,
  listUserAppointments,
  cancelAppointment,
} from "../controller/userController.js";
import authUser from "../middleware/authUser.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", authUser, getMe);
userRouter.put("/update-profile", authUser, updateProfile);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listUserAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

export default userRouter;
