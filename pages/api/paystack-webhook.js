// pages/api/paystack-webhook.js
import { buffer } from "micro";
import { supabase } from "@/utils/supabaseClient";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const buf = await buffer(req);
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];
  const expected = crypto.createHmac("sha512", secret).update(buf).digest("hex");
  if (signature !== expected) {
    console.warn("Invalid webhook signature");
    return res.status(401).send("Unauthorized");
  }

  let event;
  try {
    event = JSON.parse(buf.toString());
  } catch (e) {
    console.error("Webhook payload parse failed", e);
    return res.status(400).send("Bad payload");
  }

  if (event.event === "charge.success") {
    const data = event.data;
    const amount = data.amount / 100; // naira
    const reference = data.reference;
    const channel = data.channel;
    const paid_at = data.paid_at;
    const metadata = data.metadata || {};
    const user_id = metadata.user_id;

    if (!user_id) {
      console.error("Missing user_id in metadata for reference", reference);
      return res.status(400).json({ error: "Missing user_id in metadata" });
    }

    // Idempotency: check if already processed
    const { data: existing, error: existingErr } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .single();

    if (existing) {
      return res.status(200).json({ received: true, note: "Already processed" });
    }
    if (existingErr && existingErr.code !== "PGRST116") {
      console.error("Error checking existing transaction:", existingErr);
      return res.status(500).json({ error: "Transaction lookup failed" });
    }

    // Increment wallet (creates or updates)
    const { error: rpcError } = await supabase.rpc("increment_balance", {
      p_user_id: user_id,
      p_amount: amount,
    });

    if (rpcError) {
      console.error("RPC increment_balance failed:", rpcError);
      return res.status(500).json({ error: "Failed to update wallet" });
    }

    // Log transaction
    const { error: insertError } = await supabase.from("transactions").insert({
      user_id,
      reference,
      amount,
      status: "success",
      type: "fund",
      channel,
      paid_at,
      description: "Wallet funding via Paystack",
    });

    if (insertError) {
      console.error("Failed to insert transaction:", insertError);
      return res.status(500).json({ error: "Transaction logging failed" });
    }
  }

  return res.status(200).json({ received: true });
};

export default handler;
