// pages/api/fund-wallet.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, email, user_id } = req.body;

  // Validate input
  if (!amount || !email || !user_id) {
    console.error("Missing required fields:", { amount, email, user_id });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // convert to kobo
        metadata: {
          user_id,
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet/callback`,
      }),
    });

    const data = await paystackRes.json();

    if (data.status) {
      return res.status(200).json({ url: data.data.authorization_url });
    } else {
      console.error("Paystack error:", data);
      return res.status(400).json({ error: data.message || "Paystack error" });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
