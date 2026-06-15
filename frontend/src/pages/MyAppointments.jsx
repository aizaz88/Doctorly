import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch user appointments */
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { uToken: token },
      });

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getAppointments();
    } else {
      setLoading(false);
    }
  }, [token]);

  /* Cancel appointment */
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { uToken: token } },
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* Handle pay online button */
  const handlePayOnline = (appointmentId, appointmentData) => {
    if (!appointmentData.payment) {
      navigate(`/payment/${appointmentId}`);
    } else {
      toast.info("This appointment is already paid");
    }
  };

  /* Format date helper */
  const formatDate = (dateString) => {
    if (!dateString) return "";

    let date;

    // Backend stores slotDate as D_M_YYYY (e.g. 21_2_2026)
    if (typeof dateString === "string" && dateString.includes("_")) {
      const parts = dateString.split("_").map((p) => Number(p));
      // parts = [day, month, year]
      if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
        const [d, m, y] = parts;
        date = new Date(y, m - 1, d);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    if (Number.isNaN(date.getTime())) return dateString;

    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="pb-3 mt-10 font-semibold text-zinc-700 border-b text-lg sm:text-xl">
          My Appointments
        </p>
        <p className="mt-6 text-center text-gray-500">
          No appointments booked yet
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="pb-3 mt-10 font-semibold text-zinc-700 border-b text-lg sm:text-xl">
        My Appointments
      </p>

      <div className="mt-6 space-y-6">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className={`flex flex-col md:flex-row gap-4 md:gap-6 p-4 sm:p-5
                       border rounded-xl shadow-sm hover:shadow-md transition ${
                         appointment.cancelled ? "bg-gray-100 opacity-60" : ""
                       }`}
          >
            {/* Image */}
            <div className="flex justify-center md:justify-start">
              <img
                src={appointment.docData?.image}
                alt={appointment.docData?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32
                           object-cover rounded-lg bg-indigo-50"
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-sm sm:text-base text-zinc-600">
              <p className="text-base sm:text-lg font-semibold text-neutral-800">
                {appointment.docData?.name}
              </p>
              <p className="mb-2 text-sm sm:text-base">
                {appointment.docData?.speciality}
              </p>

              <p className="font-medium text-zinc-700">Address:</p>
              <p className="text-sm">{appointment.docData?.address?.line1}</p>
              <p className="text-sm">{appointment.docData?.address?.line2}</p>

              <p className="mt-2 text-sm">
                <span className="font-medium text-zinc-700">Date & Time:</span>{" "}
                {formatDate(appointment.slotDate)} | {appointment.slotTime}
              </p>

              {appointment.cancelled && (
                <p className="mt-2 text-red-600 font-medium">
                  Appointment Cancelled
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              className="flex flex-col sm:flex-row md:flex-col gap-3
             justify-end md:justify-center"
            >
              {appointment.isCompleted ? (
                <button
                  disabled
                  className="w-full sm:w-auto md:min-w-[160px]
                 text-sm px-4 py-2 border rounded-lg
                 bg-green-100 text-green-700 border-green-300
                 font-medium cursor-not-allowed"
                >
                  ✓ Appointment Completed
                </button>
              ) : appointment.cancelled ? (
                <button
                  disabled
                  className="w-full sm:w-auto md:min-w-[160px]
                 text-sm px-4 py-2 border rounded-lg
                 bg-red-100 text-red-700 border-red-300
                 font-medium cursor-not-allowed"
                >
                  Appointment Cancelled
                </button>
              ) : (
                <>
                  {!appointment.payment ? (
                    <button
                      onClick={() =>
                        handlePayOnline(appointment._id, appointment)
                      }
                      className="w-full sm:w-auto md:min-w-[160px]
                     text-sm px-4 py-2 border rounded-lg
                     bg-blue-600 text-white border-blue-700
                     hover:bg-blue-900 font-medium"
                    >
                      Pay Online
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full sm:w-auto md:min-w-[160px]
                     text-sm px-4 py-2 border rounded-lg
                     bg-green-100 text-green-700 border-green-300
                     font-medium cursor-not-allowed"
                    >
                      ✓ Paid
                    </button>
                  )}

                  <button
                    onClick={() => cancelAppointment(appointment._id)}
                    className="w-full sm:w-auto md:min-w-[160px]
                   text-sm px-4 py-2 border rounded-lg
                   bg-red-600 text-white border-red-700
                   hover:bg-red-900 font-medium"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
