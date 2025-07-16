// pages/api/fund-wallet.js
export default async function handler(req, res) {
  const { amount, email, user_id } = req.body;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      metadata: {
        user_id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/wallet/callback`,
    }),
  });

  const data = await paystackRes.json();

  if (data.status) {
    res.status(200).json({ url: data.data.authorization_url });
  } else {
    res.status(400).json({ error: data.message });
  }
}
