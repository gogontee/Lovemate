// pages/api/verify-payment.js
import axios from "axios";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount, reference: ref, metadata, customer } = response.data.data;

    return res.status(200).json({
      status,
      amount,
      reference: ref,
      metadata,
      customer,
    });
  } catch (err) {
    console.error("Paystack verification error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Payment verification failed",
      details: err.response?.data || null,
    });
  }
}
