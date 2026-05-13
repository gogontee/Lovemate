// pages/api/update-password.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: fetch ALL users from Supabase Auth (pagination)
async function getAllUsers() {
  let allUsers = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    if (!data.users || data.users.length === 0) break;
    allUsers = [...allUsers, ...data.users];
    if (data.users.length < perPage) break;
    page++;
  }
  return allUsers;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_resets')
      .select('expires_at, used')
      .eq('token', token)
      .eq('email', normalizedEmail)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const expiryUTC = new Date(tokenData.expires_at + 'Z');
    if (new Date() > expiryUTC) {
      return res.status(400).json({ error: "Reset link has expired" });
    }

    // 2. Find user (all users, paginated)
    const allUsers = await getAllUsers();
    const user = allUsers.find(u => u.email?.trim().toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    // 4. Mark token used
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