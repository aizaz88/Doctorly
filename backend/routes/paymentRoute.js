import express from "express";
import {
  createPaymentIntent,
  verifyPayment,
  handleStripeWebhook,
} from "../controller/paymentController.js";
import authUser from "../middleware/authUser.js";

const paymentRouter = express.Router();

// Create payment intent
paymentRouter.post("/create-intent", authUser, createPaymentIntent);

// Verify payment after completion
paymentRouter.post("/verify-payment", authUser, verifyPayment);

// Stripe webhook (raw body required - no JSON parsing)
paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

export default paymentRouter;
