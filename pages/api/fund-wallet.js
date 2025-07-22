// pages/api/fund-wallet.js

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, email, redirect_url } = req.body;

  // Debug: Show incoming data
  console.log("🔔 Incoming payment request:", { amount, email, redirect_url });

  if (!amount || !email || !redirect_url) {
    console.warn("❌ Missing required fields");
    return res.status(400).json({ error: "Amount, email, and redirect_url are required" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("❌ PAYSTACK_SECRET_KEY is not set in environment");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects kobo
        callback_url: redirect_url,
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, access_code, reference } = response.data.data;

    console.log("✅ Payment initialization successful:", {
      reference,
      authorization_url,
    });

    return res.status(200).json({
      authorization_url,
      reference,
      access_code,
    });

  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    console.error("❌ Payment initiation error:", {
      status,
      data,
      message: error.message,
    });

    return res.status(500).json({
      error: "Unable to initiate payment",
      details: data || error.message,
    });
  }
}
