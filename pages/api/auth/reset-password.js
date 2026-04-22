// pages/api/auth/reset-password.js
import { Resend } from 'resend';
import { supabase } from '../../../utils/supabaseClient';
import { createResetToken } from '../../../utils/resetToken';
import { getPasswordResetEmail } from '../../../utils/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("✅ API route was called!");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  console.log("📧 Email received:", email);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // FIXED: Changed from 'profile' to 'profiles'
    console.log("🔍 Checking if user exists in profiles table...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')  // ✅ Changed from 'profile' to 'profiles'
      .select('id, full_name, email')
      .eq('email', email)
      .maybeSingle();

    console.log("📝 Profile query result:", profile);

    if (!profile) {
      console.log("⚠️ No user found with email:", email);
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    console.log("✅ User found! ID:", profile.id);
    console.log("✅ User name:", profile.full_name);

    // Create reset token
    console.log("🔐 Creating reset token...");
    const { token } = await createResetToken(email);
    console.log("✅ Token created");
    
    // Create reset link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL 
      : 'http://localhost:3000';
    
    const resetLink = `${baseUrl}/auth/update-password?token=${token}`;
    const userName = profile?.full_name || email.split('@')[0];
    
    console.log("📧 Attempting to send email to:", email);
    console.log("📧 From email:", process.env.RESEND_FROM_EMAIL);
    
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lovemateshow.com',
      to: email,
      subject: 'Reset Your Lovemate Show Password 🔐',
      html: getPasswordResetEmail(resetLink, userName),
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    console.log("✅ Email sent successfully!");
    
    return res.status(200).json({ 
      message: 'Password reset link has been sent to your email.'
    });
    
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(200).json({ 
      message: 'If an account exists with this email, you will receive a password reset link.'
    });
  }
}