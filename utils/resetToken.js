// utils/resetToken.js
import { supabase } from './supabaseClient';
import crypto from 'crypto';

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createResetToken = async (email) => {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  // Delete any existing tokens for this email
  await supabase
    .from('password_resets')
    .delete()
    .eq('email', email);

  // Insert new token
  const { data, error } = await supabase
    .from('password_resets')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false
    })
    .select()
    .single();

  if (error) throw error;
  return { token, expiresAt };
};

export const verifyResetToken = async (token) => {
  const { data, error } = await supabase
    .from('password_resets')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (error || !data) return null;

  // Check if token is expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data;
};

export const markTokenAsUsed = async (token) => {
  const { error } = await supabase
    .from('password_resets')
    .update({ used: true })
    .eq('token', token);

  if (error) throw error;
};