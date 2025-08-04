// pages/api/fallback-verify-and-credit.js
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  try {
    console.log("Fallback verify start for reference:", reference);

    // 1. Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    console.log("Paystack verify raw response:", paystackRes.data);
    const trx = paystackRes.data.data;

    if (!trx || trx.status !== "success") {
      console.warn("Transaction not successful in verify:", trx);
      return res
        .status(400)
        .json({ status: "failed", message: "Transaction not successful", raw: trx });
    }

    const amount = trx.amount / 100;
    const userId = trx.metadata?.user_id;
    if (!userId) {
      console.error("Missing user_id in metadata:", trx.metadata);
      return res.status(400).json({ error: "Missing user_id in metadata" });
    }

    // 2. Idempotency check (admin client)
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingErr) {
      console.error("Error checking existing transaction:", existingErr);
      return res
        .status(500)
        .json({ error: "Existing transaction lookup failed", details: existingErr });
    }

    if (existing) {
      console.log("Transaction already recorded:", reference);
      return res.status(200).json({ status: "already_recorded" });
    }

    // 3. Ensure wallet exists (admin client)
    const { data: walletRow, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletErr) {
      console.error("Wallet lookup error:", walletErr);
      return res
        .status(500)
        .json({ error: "Wallet lookup failed", details: walletErr });
    }

    if (!walletRow) {
      console.log("Creating wallet for user:", userId);
      const { error: createWalletErr } = await supabaseAdmin.from("wallets").insert({
        user_id: userId,
        balance: 0,
      });
      if (createWalletErr) {
        console.error("Failed to create wallet:", createWalletErr);
        throw createWalletErr;
      }
    }

    // 4. Increment balance via RPC (admin client)
    const { error: rpcErr } = await supabaseAdmin.rpc("increment_balance", {
      p_user_id: userId,
      p_amount: amount,
    });
    if (rpcErr) {
      console.error("RPC increment_balance error:", rpcErr);
      throw rpcErr;
    }

    // 5. Insert transaction (admin client)
    const { error: insertErr } = await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      reference,
      amount,
      status: "success",
      type: "fund",
      channel: trx.channel,
      paid_at: trx.paid_at,
    });
    if (insertErr) {
      console.error("Insert transaction error:", insertErr);
      throw insertErr;
    }

    console.log("Fallback credit successful for:", reference);
    return res.status(200).json({ status: "credited_fallback" });
  } catch (err) {
    console.error("Fallback verify error:", err.response?.data || err.message || err);
    return res.status(500).json({
      error: "Fallback verification failed",
      details: err.response?.data || err.message || err,
    });
  }
}
