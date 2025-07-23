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
  const buf = await buffer(req);
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = req.headers["x-paystack-signature"];

  const expectedHash = crypto.createHmac("sha512", secret).update(buf).digest("hex");

  if (hash !== expectedHash) {
    return res.status(401).send("Unauthorized");
  }

  const event = JSON.parse(buf.toString());

  if (event.event === "charge.success") {
    const data = event.data;
    const amount = data.amount / 100; // Convert from kobo to naira
    const reference = data.reference;
    const email = data.customer.email;

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from("profile")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      console.error("❌ User not found for email:", email, userError);
      return res.status(400).json({ error: "User not found" });
    }

    // Check if transaction is already recorded
    const { data: existing, error: txnError } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (txnError) {
      console.error("❌ Error checking existing transaction:", txnError);
      return res.status(500).json({ error: "Transaction check failed" });
    }

    if (!existing) {
      // ✅ Use the RPC function to increment balance
      const { error: rpcError } = await supabase.rpc("increment_balance", {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (rpcError) {
        console.error("❌ Error incrementing balance:", rpcError);
        return res.status(500).json({ error: "Failed to update balance" });
      }

      // ✅ Log the transaction
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount,
        reference,
        type: "credit",
        status: "success",
      });

      if (insertError) {
        console.error("❌ Failed to log transaction:", insertError);
        return res.status(500).json({ error: "Transaction logging failed" });
      }
    }
  }

  res.status(200).json({ received: true });
};

export default handler;
