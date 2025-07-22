// pages/api/fund-wallet.js

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, email, redirect_url } = req.body;

  if (!amount || !email || !redirect_url) {
    return res.status(400).json({ error: "Amount, email, and redirect_url are required" });
  }

  try {
    console.log("Initiating payment with:", { email, amount, redirect_url });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        callback_url: redirect_url, // ✅ use dynamic callback
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url } = response.data.data;
    return res.status(200).json({ authorization_url }); // 🔁 fix key name to match frontend

  } catch (error) {
    console.error("Payment initiation error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return res.status(500).json({ error: "Unable to initiate payment" });
  }
}
