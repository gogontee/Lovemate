// pages/api/fund-wallet.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { amount, email, user_id, redirect_url } = req.body;

  // Basic validation
  const missing = [];
  if (!email) missing.push("email");
  if (!user_id) missing.push("user_id");
  if (!redirect_url) missing.push("redirect_url");
  if (amount === undefined || amount === null || isNaN(amount)) missing.push("amount");
  if (missing.length) {
    return res.status(400).json({ error: `Missing or invalid fields: ${missing.join(", ")}` });
  }
  if (Number(amount) < 100) {
    return res.status(400).json({ error: "Invalid amount. Minimum is 100." });
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Missing Paystack secret key");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Number(amount) * 100, // kobo
        callback_url: redirect_url,
        metadata: { user_id },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data.data); // includes authorization_url, reference, etc.
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Unable to initiate payment" });
  }
}
