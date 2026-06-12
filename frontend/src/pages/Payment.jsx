import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/StripePaymentForm";
import axios from "axios";
import { toast } from "react-toastify";

// Stripe loaded from CDN in index.html
const stripePromise = window.Stripe
  ? Promise.resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY))
  : Promise.reject(new Error("Stripe not loaded"));

const Payment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/appointments`,
          { headers: { uToken: token } },
        );

        if (data.success) {
          const apt = data.appointments.find((a) => a._id === appointmentId);
          if (apt) {
            setAppointment(apt);
          } else {
            toast.error("Appointment not found");
            navigate("/my-appointments");
          }
        }
      } catch (error) {
        toast.error("Failed to load appointment");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token && appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, token, backendUrl, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Appointment Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.docData?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {appointment.docData?.speciality}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="text-lg font-semibold text-gray-800">
                  {appointment.userData?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {appointment.userData?.email}
                </p>
              </div>

              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {appointment.slotDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {appointment.slotTime}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600">Consultation Fee</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${appointment.amount}
                </p>
              </div>

              {appointment.payment && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  ✓ Payment completed successfully
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div>
            {appointment.payment ? (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-green-600 mb-6">
                  Your appointment has been confirmed and paid.
                </p>
                <button
                  onClick={() => navigate("/my-appointments")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
                >
                  View My Appointments
                </button>
              </div>
            ) : (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  appointmentId={appointmentId}
                  amount={appointment.amount}
                  backendUrl={backendUrl}
                  token={token}
                  onPaymentSuccess={() => {
                    setAppointment({ ...appointment, payment: true });
                  }}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
