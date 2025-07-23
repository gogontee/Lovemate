// pages/api/verify-transaction.js
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
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response;

    if (data?.data?.status === "success") {
      const trx = data.data;
      return res.status(200).json({
        status: "success",
        amount: trx.amount,
        email: trx.customer.email,
        reference: trx.reference,
        paid_at: trx.paid_at,
        channel: trx.channel,
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: data?.message || "Transaction not successful",
      });
    }
  } catch (error) {
    console.error("❌ Paystack verification error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
}
