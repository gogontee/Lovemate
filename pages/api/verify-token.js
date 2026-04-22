import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, email } = req.body;

    const { data, error } = await supabase
      .from('password_resets')
      .select('expires_at, used')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .single();

    if (error || !data) {
      return res.status(400).json({ valid: false, error: "Invalid reset link" });
    }

    const expiryUTC = new Date(data.expires_at + 'Z');
    if (new Date() > expiryUTC) {
      return res.status(400).json({ valid: false, error: "Reset link has expired" });
    }

    return res.status(200).json({ valid: true });
  } catch (err) {
    return res.status(500).json({ valid: false, error: "Server error" });
  }
}