// pages/api/verify-payment.js
import axios from "axios";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = response.data.data;

    res.status(200).json({
      status: data.status,
      amount: data.amount,
      metadata: data.metadata, // Includes user_id if sent during init
      reference: data.reference,
    });
  } catch (err) {
    console.error("Verification error:", err.response?.data || err.message);
    res.status(500).json({ error: "Verification failed" });
  }
}
