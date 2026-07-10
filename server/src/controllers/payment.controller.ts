import { Request, Response } from "express";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import User from "@/models/User.model.js";

export const createGCashPayment = async (req: Request, res: Response) => {
  try {
    const { amount, description, tokens } = req.body;
    const userId = (req as any).user?._id;

    // Using PayMongo Checkout API for redirection support
    const options = {
      method: "POST",
      url: "https://api.paymongo.com/v1/checkout_sessions",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(
          `${process.env.PAYMONGO_SECRET_KEY || "sk_test_..."}:`
        ).toString("base64")}`,
      },
      data: {
        data: {
          attributes: {
            send_email_receipt: false,
            show_description: true,
            show_line_items: true,
            cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/`,
            success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/?payment=success`,
            line_items: [
              {
                amount: amount || 50000,
                currency: "PHP",
                name: `GradCoins`,
                description: description || "SipaCareer Payment",
                quantity: 1,
              }
            ],
            payment_method_types: ["gcash"],
            reference_number: JSON.stringify({ userId, tokens }),
            description: description || "SipaCareer Payment",
          },
        },
      },
    };

    const response = await axios.request(options);
    const checkoutUrl = response.data.data.attributes.checkout_url;

    res.status(StatusCodes.OK).json({
      success: true,
      checkoutUrl, // The frontend will redirect the user here
      paymentId: response.data.data.id,
    });
  } catch (error: any) {
    console.error("PayMongo Error:", error.response?.data || error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create payment link",
    });
  }
};

export const handlePayMongoWebhook = async (req: Request, res: Response) => {
  try {
    const signatureHeader = req.headers['paymongo-signature'] as string;
    const webhookSecretKey = process.env.PAYMONGO_WEBHOOK_SECRET;

    // Verify Signature if Secret Key is provided
    if (webhookSecretKey && signatureHeader) {
      const rawBody = (req as any).rawBody;
      const signatureElements = signatureHeader.split(',');
      let t = '', te = '', li = '';

      signatureElements.forEach(el => {
        const [key, value] = el.split('=');
        if (key === 't') t = value;
        if (key === 'te') te = value;
        if (key === 'li') li = value;
      });

      // Use 'te' (test) or 'li' (live) based on environment
      const signatureToCompare = (process.env.NODE_ENV === 'production' && li) ? li : te;

      const hmac = crypto.createHmac('sha256', webhookSecretKey);
      const digest = hmac.update(t + '.' + rawBody).digest('hex');

      if (signatureToCompare !== digest) {
        console.error("Webhook signature verification failed!");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }
    }

    // Process the event
    const event = req.body;

    if (event.data?.attributes?.type === "checkout_session.payment.paid") {
      const paymentData = event.data.attributes.data;
      const referenceNumber = paymentData.attributes.reference_number;
      console.log(`Payment Success for Checkout ID: ${paymentData.id}`);
      
      if (referenceNumber) {
        try {
          const { userId, tokens } = JSON.parse(referenceNumber);
          if (userId && tokens) {
            await User.findByIdAndUpdate(userId, {
              $inc: { aiTokens: Number(tokens) }
            });
            console.log(`Successfully added ${tokens} aiTokens to User ${userId}`);
          }
        } catch (parseError) {
          console.error("Error parsing reference_number for webhook:", parseError);
        }
      }
    }

    res.status(StatusCodes.OK).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Webhook failed" });
  }
};
