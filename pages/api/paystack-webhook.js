// pages/api/paystack-webhook.js
import { supabase } from "@/utils/supabaseClient";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false, // Important for raw body
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await buffer(req);
  const sig = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== sig) return res.status(401).send("Invalid signature");

  const event = JSON.parse(rawBody.toString());

  if (event.event === "charge.success") {
    const { metadata, amount } = event.data;
    const userId = metadata?.user_id;

    if (!userId) return res.status(400).send("User ID not found");

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError) return res.status(500).send("Wallet fetch failed");

    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: (wallet.balance || 0) + amount / 100 })
      .eq("user_id", userId);

    if (updateError) return res.status(500).send("Wallet update failed");

    return res.status(200).send("Wallet updated");
  }

  res.status(200).send("OK");
}
