// pages/api/payment-status.js
import { supabase } from "@/utils/supabaseClient";

export default async function handler(req, res) {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  try {
    const { data: trx, error } = await supabase
      .from("transactions")
      .select("status, amount, user_id, paid_at")
      .eq("reference", reference)
      .single();

    if (error) {
      // Not found yet: still pending
      return res.status(200).json({ status: "pending" });
    }

    // Optionally, also fetch wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", trx.user_id)
      .maybeSingle();

    return res.status(200).json({
      status: trx.status,
      amount: trx.amount,
      wallet_balance: wallet?.balance ?? null,
      paid_at: trx.paid_at,
    });
  } catch (e) {
    console.error("Payment status error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
