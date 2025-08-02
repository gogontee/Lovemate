// pages/api/fund-wallet.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, email, user_id, redirect_url } = req.body;

  // Debug incoming payload
  console.log("🔔 Incoming payment request:", {
    amount,
    email,
    user_id,
    redirect_url,
  });

  if (!amount || isNaN(amount) || Number(amount) < 100) {
    return res.status(400).json({ error: "Invalid amount. Minimum is 100." });
  }
  if (!email || !user_id || !redirect_url) {
    return res.status(400).json({
      error: "email, user_id, amount, and redirect_url are required",
    });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("❌ PAYSTACK_SECRET_KEY not configured");
    return res
      .status(500)
      .json({ error: "Server misconfiguration: missing Paystack secret key." });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Number(amount) * 100, // convert to kobo
        callback_url: redirect_url,
        metadata: {
          user_id, // important: embed the user_id for webhook attribution
        },
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
      access_code,
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
