// pages/api/verify-transaction.js
import axios from "axios";
import { supabase } from "@/utils/supabaseClient";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // 1. Verify with Paystack
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

    if (data?.data?.status !== "success") {
      return res.status(400).json({
        status: "failed",
        message: data?.message || "Transaction not successful",
      });
    }

    const trx = data.data;
    const amount = trx.amount / 100;

    // 2. Get the user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser(req);

    if (!user || userError) {
      console.error("❌ User error:", userError?.message || "User not found");
      return res.status(401).json({ status: "failed", message: "User not authenticated" });
    }

    // 3. Call RPC to update wallet and transaction table
    const { error } = await supabase.rpc("increment_balance", {
      p_user_id: user.id,
      p_amount: amount,
    });

    if (error) {
      console.error("❌ Supabase RPC Error:", error.message);
      return res.status(500).json({ status: "failed", message: "Failed to update wallet" });
    }

    // ✅ All good
    return res.status(200).json({
      status: "success",
      amount: trx.amount,
      email: trx.customer.email,
      reference: trx.reference,
      paid_at: trx.paid_at,
      channel: trx.channel,
    });
  } catch (error) {
    console.error("❌ Paystack verification error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
}
