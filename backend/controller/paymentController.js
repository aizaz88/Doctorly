import Stripe from "stripe";
import appointmentModel from "../model/appointmentModel.js";
import doctorModel from "../model/doctorModel.js";
import userModel from "../model/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;

    // Get appointment details
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify the appointment belongs to the user
    if (appointment.userId !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if already paid
    if (appointment.payment) {
      return res.json({
        success: false,
        message: "Appointment already paid",
      });
    }

    // Get user details for customer info
    const user = await userModel.findById(userId);

    const amount = Math.round(appointment.amount * 100); // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd", // Stripe doesn't support PKR directly, use USD
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId.toString(),
        doctorId: appointment.docId.toString(),
      },
      receipt_email: user.email,
      description: `Appointment with Dr. ${appointment.docData.name}`,
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      appointmentId,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Payment and Update Appointment
const verifyPayment = async (req, res) => {
  try {
    const { appointmentId, paymentIntentId } = req.body;
    const userId = req.userId;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment was successful
    if (paymentIntent.status !== "succeeded") {
      return res.json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Security: Verify metadata matches
    if (
      paymentIntent.metadata.appointmentId !== appointmentId ||
      paymentIntent.metadata.userId !== userId
    ) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Update appointment as paid
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        payment: true,
        paymentIntentId: paymentIntentId,
        paymentDate: new Date(),
      },
      { new: true },
    );

    if (!updatedAppointment) {
      return res.json({
        success: false,
        message: "Failed to update appointment",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Webhook handler for Stripe events (optional but recommended for production)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const { appointmentId } = paymentIntent.metadata;

      // Update appointment in database
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentIntentId: paymentIntent.id,
        paymentDate: new Date(),
      });

      console.log(`✓ Payment succeeded for appointment: ${appointmentId}`);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(
        `✗ Payment failed for appointment: ${failedPayment.metadata.appointmentId}`,
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

export { createPaymentIntent, verifyPayment, handleStripeWebhook };
