// pages/api/verify-transaction.js
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

    if (data.status === "success") {
      return res.status(200).json({
        status: "success",
        amount: data.amount,
        email: data.customer.email,
      });
    } else {
      return res.status(400).json({ status: "failed" });
    }
  } catch (error) {
    console.error("Paystack verification error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
}
