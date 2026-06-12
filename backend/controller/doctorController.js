import doctorModel from "../model/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../model/appointmentModel.js";
// Get all doctors list
const listDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ available: true })
      .select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment as completed
const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: 1,
    });

    return res.json({ success: true, message: "Appointment completed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointmentDoctor = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: 1,
    });

    // Release the slot
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

export {
  listDoctors,
  loginDoctor,
  appointmentsDoctor,
  completeAppointment,
  cancelAppointmentDoctor,
};
