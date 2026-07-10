import express from "express";
import { createGCashPayment, handlePayMongoWebhook } from "../controllers/payment.controller.js";
import { authenticationMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Endpoint for frontend to create a payment link
router.post("/create-gcash", authenticationMiddleware, createGCashPayment);

// Endpoint for PayMongo to send webhooks
router.post("/webhook", handlePayMongoWebhook);

export default router;
