import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StripePaymentForm = ({
  appointmentId,
  amount,
  backendUrl,
  token,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    setCardError("");

    if (!stripe || !elements) {
      setCardError("Stripe not loaded yet");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setCardError("Card element not found");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Payment Intent on backend
      const { data: intentData } = await axios.post(
        `${backendUrl}/api/payment/create-intent`,
        { appointmentId },
        { headers: { uToken: token } },
      );

      if (!intentData.success) {
        setCardError(intentData.message);
        setLoading(false);
        return;
      }

      const clientSecret = intentData.clientSecret;

      // Step 2: Confirm payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        },
      );

      if (error) {
        setCardError(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Step 3: Verify payment on backend
        const { data: verifyData } = await axios.post(
          `${backendUrl}/api/payment/verify-payment`,
          {
            appointmentId,
            paymentIntentId: paymentIntent.id,
          },
          { headers: { uToken: token } },
        );

        if (verifyData.success) {
          toast.success("Payment successful! Your appointment is confirmed.");
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          setTimeout(() => navigate("/my-appointments"), 2000);
        } else {
          setCardError(verifyData.message);
        }
      }
    } catch (error) {
      setCardError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Details</h2>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-gray-700 font-semibold">
          Amount to Pay:{" "}
          <span className="text-blue-600 text-xl">${amount.toFixed(2)}</span>
        </p>
      </div>

      <form onSubmit={handlePayment}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
            className="p-4 border border-gray-300 rounded"
          />
        </div>

        {cardError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {cardError}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 px-4 rounded font-semibold text-white transition ${
            loading || !stripe
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        This is a test payment. Use Stripe test card: 4242 4242 4242 4242
      </p>
    </div>
  );
};

export default StripePaymentForm;
