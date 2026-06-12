import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import doctorModel from "../model/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../model/appointmentModel.js";
import razorpay from "razorpay";

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details..." });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter valid Email...",
      });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password length must be 8" });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details..." });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get current user (protected)
const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update user profile (protected) - accepts image as base64 in body
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, gender, dob, image } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (gender !== undefined) update.gender = gender;
    if (dob !== undefined) update.dob = dob;
    if (address !== undefined) update.address = address;

    if (image !== undefined) {
      // If image is a base64 data URL, upload to Cloudinary
      if (typeof image === "string" && image.startsWith("data:")) {
        const uploaded = await cloudinary.uploader.upload(image, {
          resource_type: "image",
        });
        update.image = uploaded.secure_url;
      } else {
        update.image = image;
      }
    }

    const updated = await userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select("-password");

    if (!updated)
      return res.json({ success: false, message: "User not found" });

    return res.json({
      success: true,
      user: updated,
      message: "Profile updated",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

////////////////////////////////////////////////////////////////////////////////////
//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId; // Get from auth middleware
    const { docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor isn't available" });
    }

    let slots_booked = docData.slots_booked;
    //check slot available

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    //User data
    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    return res.json({
      success: true,
      message: "Appointment Booked... Proceeding to Payment",
      appointmentId: newAppointment._id,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get user appointments (protected)
const listUserAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    return res.json({ success: true, appointments });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Cancel user appointment (protected)
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: 1,
    });

    // Release the slot by removing it from doctor's slots_booked
    const docId = appointment.docId;
    const slotDate = appointment.slotDate;
    const slotTime = appointment.slotTime;

    const docData = await doctorModel.findById(docId);
    if (docData.slots_booked[slotDate]) {
      docData.slots_booked[slotDate] = docData.slots_booked[slotDate].filter(
        (time) => time !== slotTime,
      );
    }

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked: docData.slots_booked,
    });

    return res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////Razorpay appointments payment method------/////////////////////////////////////

export {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  bookAppointment,
  listUserAppointments,
  cancelAppointment,
};
