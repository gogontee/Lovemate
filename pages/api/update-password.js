import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Only use service role here, in API route
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify token exists and is valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Check if expired
    const now = new Date();
    const expiry = new Date(tokenData.expires_at);
    if (now > expiry) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      return res.status(500).json({ error: "Error finding user" });
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Mark token as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('token', token);

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Failed to update password" });
  }
}