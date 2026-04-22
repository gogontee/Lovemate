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
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the token without any time filter
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      // Check if token exists but is used or invalid
      const { data: existingToken } = await supabase
        .from('password_resets')
        .select('expires_at, used')
        .eq('token', token)
        .eq('email', email)
        .single();
      
      if (existingToken && existingToken.used) {
        return res.status(400).json({ error: "This reset link has already been used." });
      }
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // 🔥 Fix: Append 'Z' to treat database timestamp as UTC
    const expiryUTC = new Date(tokenData.expires_at + 'Z');
    const nowUTC = new Date();
    
    if (nowUTC > expiryUTC) {
      return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
    }

    // Get user by email using admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("User lookup error:", userError);
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
      console.error("Update error:", updateError);
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