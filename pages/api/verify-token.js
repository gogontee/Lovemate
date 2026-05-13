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
    console.log("[verify] Received token:", token);
    console.log("[verify] Received email:", email);

    if (!token || !email) {
      return res.status(400).json({ valid: false, error: "Missing token or email" });
    }

    // Normalise email (trim, lowercase) for database lookup
    const normalizedEmail = email.trim().toLowerCase();
    console.log("[verify] Normalised email:", normalizedEmail);

    // Look up token in password_resets
    const { data, error } = await supabase
      .from('password_resets')
      .select('expires_at, used')
      .eq('token', token)
      .eq('email', normalizedEmail)
      .eq('used', false)
      .single();

    if (error) {
      console.error("[verify] Database error:", error);
      // Could be no row found
      return res.status(400).json({ valid: false, error: "Invalid reset link" });
    }

    if (!data) {
      console.log("[verify] No token found for", token);
      return res.status(400).json({ valid: false, error: "Invalid reset link" });
    }

    console.log("[verify] Token data:", data);

    // Parse expiration with UTC (append Z)
    const expiryUTC = new Date(data.expires_at + 'Z');
    const nowUTC = new Date();
    console.log("[verify] Expiry UTC:", expiryUTC.toISOString());
    console.log("[verify] Now UTC:", nowUTC.toISOString());

    if (nowUTC > expiryUTC) {
      console.log("[verify] Token expired");
      return res.status(400).json({ valid: false, error: "Reset link has expired" });
    }

    console.log("[verify] Token is valid");
    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error("[verify] Unhandled error:", err);
    return res.status(500).json({ valid: false, error: "Server error" });
  }
}