// pages/api/payment-status.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  try {
    // Fetch the transaction (bypass RLS)
    const { data: trx, error: trxErr } = await supabaseAdmin
      .from("transactions")
      .select("user_id, amount, status, paid_at")
      .eq("reference", reference)
      .maybeSingle();

    if (trxErr) {
      console.error("Error fetching transaction:", trxErr);
      return res.status(200).json({ status: "pending" });
    }

    if (!trx) {
      return res.status(200).json({ status: "pending" });
    }

    // Fetch wallet balance (bypass RLS)
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", trx.user_id)
      .maybeSingle();

    if (walletErr) {
      console.warn("Error fetching wallet:", walletErr);
    }

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
