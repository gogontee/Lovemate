// pages/api/check-paystack.js
import axios from "axios";

export default async function handler(req, res) {
  const { reference } = req.query;
  
  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // Verify with Paystack directly
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        timeout: 10000,
      }
    );

    const data = response.data.data;
    
    return res.status(200).json({
      status: data.status,
      amount: data.amount / 100,
      paid: data.status === "success",
      reference: data.reference,
      channel: data.channel,
      paid_at: data.paid_at
    });
  } catch (error) {
    console.error("Paystack direct check error:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: "Failed to verify with Paystack",
      details: error.response?.data || error.message
    });
  }
}