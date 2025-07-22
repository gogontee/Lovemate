// pages/api/paystack-webhook.js
import { buffer } from "micro";
import { supabase } from "@/utils/supabaseClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const buf = await buffer(req);
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = req.headers["x-paystack-signature"];

  const crypto = require("crypto");
  const expectedHash = crypto
    .createHmac("sha512", secret)
    .update(buf)
    .digest("hex");

  if (hash !== expectedHash) {
    return res.status(401).send("Unauthorized");
  }

  const event = JSON.parse(buf.toString());

  if (event.event === "charge.success") {
    const data = event.data;
    const amount = data.amount / 100;
    const reference = data.reference;
    const email = data.customer.email;

    // You MUST map email or metadata to user_id
    const { data: user } = await supabase
      .from("profile")
      .select("id")
      .eq("email", email)
      .single();

    if (user) {
      // Check if already credited
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();

      if (!existing) {
        await supabase.from("wallets").update({
          balance: supabase.rpc("increment_balance", {
            user_id: user.id,
            amount,
          }),
        }).eq("user_id", user.id);

        await supabase.from("transactions").insert({
          user_id: user.id,
          amount,
          reference,
          type: "credit",
          status: "success",
        });
      }
    }
  }

  res.status(200).json({ received: true });
};

export default handler;
