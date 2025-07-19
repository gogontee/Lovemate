// pages/api/verify-payment.js
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Must be service role key
);

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // 1. Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount, reference: ref, metadata, customer } = response.data.data;

    // Ensure it's a successful transaction
    if (status !== "success") {
      return res.status(400).json({ error: "Transaction not successful" });
    }

    const userId = metadata?.user_id;
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID in metadata" });
    }

    const nairaAmount = amount / 100;

    // 2. Get current wallet balance
    const { data: userProfile, error: fetchError } = await supabase
      .from("profile")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const newBalance = (userProfile.wallet_balance || 0) + nairaAmount;

    // 3. Update wallet balance
    const { error: updateError } = await supabase
      .from("profile")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    // 4. Log the transaction (optional)
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: nairaAmount,
        reference: ref,
        type: "wallet_funding",
        status: "success",
      },
    ]);

    return res.status(200).json({
      status,
      amount: nairaAmount,
      reference: ref,
      metadata,
      customer,
      newBalance,
    });
  } catch (err) {
    console.error("Paystack verification error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Payment verification failed",
      details: err.response?.data || err.message,
    });
  }
}
