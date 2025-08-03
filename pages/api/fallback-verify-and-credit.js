// pages/api/fallback-verify-and-credit.js
import axios from "axios";
import { supabase } from "@/utils/supabaseClient";

export default async function handler(req, res) {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  try {
    // 1. Verify transaction with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const trx = paystackRes.data.data;
    if (trx.status !== "success") {
      return res.status(400).json({ status: "failed", message: "Transaction not successful" });
    }

    const amount = trx.amount / 100;
    const userId = trx.metadata?.user_id;
    if (!userId) return res.status(400).json({ error: "Missing user_id in metadata" });

    // 2. Idempotency: check existing
    const { data: existing, error: existingErr } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .single();

    if (existing && !existingErr) {
      return res.status(200).json({ status: "already_recorded" });
    }

    // 3. Ensure wallet exists
    const { data: walletRow, error: walletErr } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (walletErr) throw walletErr;

    if (!walletRow) {
      const { error: createWalletErr } = await supabase.from("wallets").insert({
        user_id: userId,
        balance: 0,
      });
      if (createWalletErr) throw createWalletErr;
    }

    // 4. Increment balance
    const { error: rpcErr } = await supabase.rpc("increment_balance", {
      p_user_id: userId,
      p_amount: amount,
    });
    if (rpcErr) throw rpcErr;

    // 5. Log transaction
    const { error: insertErr } = await supabase.from("transactions").insert({
      user_id: userId,
      reference,
      amount,
      status: "success",
      type: "fund",
      channel: trx.channel,
      paid_at: trx.paid_at,
    });
    if (insertErr) throw insertErr;

    return res.status(200).json({ status: "credited_fallback" });
  } catch (err) {
    console.error("Fallback verify error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Fallback verification failed" });
  }
}
