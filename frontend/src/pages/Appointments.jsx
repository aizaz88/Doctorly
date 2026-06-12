import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const {
    doctors,
    currencySymbol = "$",
    backendUrl,
    token,
    getDoctorsData,
  } = useContext(AppContext);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  /* ---------------- Fetch Doctor Info ---------------- */
  useEffect(() => {
    const doctor = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctor || null);
  }, [doctors, docId]);

  /* ---------------- Generate Slots ---------------- */
  useEffect(() => {
    if (!docInfo) return;

    setDocSlots([]);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        currentDate.setHours(
          currentDate.getHours() >= 10 ? currentDate.getHours() + 1 : 10,
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      const timeSlots = [];

      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const slotDate = `${currentDate.getDate()}_${
          currentDate.getMonth() + 1
        }_${currentDate.getFullYear()}`;

        const isBooked =
          docInfo.slots_booked?.[slotDate]?.includes(formattedTime);

        if (!isBooked) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  }, [docInfo]);

  /* ---------------- Book Appointment ---------------- */
  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      const slotDate = `${date.getDate()}_${
        date.getMonth() + 1
      }_${date.getFullYear()}`;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { uToken: token } },
      );

      if (data.success) {
        toast.success("Appointment booked! Proceeding to payment...");
        getDoctorsData();
        // Redirect to payment page with the appointment ID
        navigate(`/payment/${data.appointmentId}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    docInfo && (
      <div className="max-w-6xl mx-auto px-4">
        {/* -------- Doctor Info -------- */}
        <div className="flex flex-col sm:flex-row gap-6 mt-10">
          <img
            src={docInfo.image}
            alt=""
            className="bg-blue-700 sm:w-72 rounded-xl"
          />

          <div className="flex-1 border rounded-xl p-6 bg-white">
            <p className="text-2xl font-semibold flex items-center gap-2">
              {docInfo.name}
              <img src={assets.verified_icon} className="w-5" />
            </p>

            <p className="text-gray-600 mt-1">
              {docInfo.degree} · {docInfo.speciality}
            </p>

            <button className="border px-3 py-1 text-xs rounded-full mt-2">
              {docInfo.experience}
            </button>

            <div className="mt-4">
              <p className="font-medium text-gray-700 flex gap-1 items-center">
                About <img src={assets.info_icon} className="w-4" />
              </p>
              <p className="text-sm text-gray-500 mt-1">{docInfo.about}</p>
            </div>

            <p className="mt-4 font-medium text-gray-700">
              Appointment fee:
              <span className="text-gray-900 ml-1">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* -------- Booking Slots -------- */}
        <div className="mt-10 sm:ml-80">
          <p className="font-medium text-gray-700">Booking slots</p>

          <div className="flex gap-4 overflow-x-auto mt-4">
            {docSlots.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime("");
                }}
                className={`min-w-16 text-center py-6 rounded-full cursor-pointer ${
                  slotIndex === index ? "bg-blue-700 text-white" : "border"
                }`}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 overflow-x-auto mt-4">
            {docSlots[slotIndex]?.map((item, index) => (
              <p
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`px-5 py-2 rounded-full cursor-pointer text-sm ${
                  slotTime === item.time
                    ? "bg-blue-700 text-white"
                    : "border text-gray-400"
                }`}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>

          <button
            disabled={!slotTime}
            onClick={bookAppointment}
            className={`mt-6 px-14 py-3 rounded-full text-sm ${
              slotTime
                ? "bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Book an appointment
          </button>
        </div>

        {/* -------- Related Doctors -------- */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
