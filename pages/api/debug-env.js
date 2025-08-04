export default function handler(req, res) {
  res.status(200).json({
    paystack_secret_key: process.env.PAYSTACK_SECRET_KEY ? "loaded" : "missing",
    site_url: process.env.NEXT_PUBLIC_SITE_URL || null,
  });
}
