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
  if (req.method !== "POST") {
    console.log("Webhook invoked with non-POST method:", req.method);
    return res.status(405).send("Method Not Allowed");
  }

  const buf = await buffer(req);
  console.log("🟡 Webhook received at:", new Date().toISOString());
  console.log("Headers:", req.headers);
  console.log("Raw body preview:", buf.toString().slice(0, 1000)); // first KB for visibility

  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const signature = req.headers["x-paystack-signature"] || "";
  const expectedHash = crypto.createHmac("sha512", secret).update(buf).digest("hex");

  if (signature !== expectedHash) {
    console.warn("❗ Webhook signature mismatch", {
      received: signature,
      expected: expectedHash,
    });
    return res.status(401).send("Unauthorized - signature mismatch");
  }

  let event;
  try {
    event = JSON.parse(buf.toString());
  } catch (e) {
    console.error("Invalid webhook payload JSON:", e);
    return res.status(400).send("Bad payload");
  }

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference;
    const amount = data.amount / 100; // Convert to naira
    const userId = data.metadata?.user_id;
    const channel = data.channel;
    const paid_at = data.paid_at;

    console.log("Processing charge.success:", { reference, userId, amount, channel, paid_at });

    if (!userId) {
      console.error("Missing user_id in metadata for reference:", reference);
      return res.status(400).json({ error: "Missing user_id in metadata" });
    }

    try {
      // Idempotency: check if transaction already exists
      const { data: existing, error: existingErr } = await supabase
        .from("transactions")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();

      if (existingErr) {
        console.error("Error checking existing transaction:", existingErr);
        return res.status(500).json({ error: "Transaction lookup failed" });
      }

      if (!existing) {
        // Ensure wallet exists
        const { data: walletRow, error: walletErr } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (walletErr) {
          console.error("Wallet lookup error:", walletErr);
          return res.status(500).json({ error: "Wallet lookup failed" });
        }

        if (!walletRow) {
          const { error: createWalletErr } = await supabase.from("wallets").insert({
            user_id: userId,
            balance: 0,
          });
          if (createWalletErr) throw createWalletErr;
        }

        // Increment balance via RPC
        const { error: rpcErr } = await supabase.rpc("increment_balance", {
          p_user_id: userId,
          p_amount: amount,
        });
        if (rpcErr) throw rpcErr;

        // Log transaction
        const { error: insertErr } = await supabase.from("transactions").insert({
          user_id: userId,
          reference,
          amount,
          status: "success",
          type: "fund",
          channel,
          paid_at,
        });
        if (insertErr) throw insertErr;

        console.log("✅ Webhook processing complete and wallet funded for:", reference);
      } else {
        console.log("Transaction already processed, skipping:", reference);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Processing failed" });
    }
  }

  // Acknowledge other events
  return res.status(200).json({ received: true });
};

export default handler;
