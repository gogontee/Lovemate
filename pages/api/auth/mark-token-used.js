// pages/api/auth/mark-token-used.js
import { markTokenAsUsed } from '../../../utils/resetToken';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    await markTokenAsUsed(token);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark token used error:', error);
    return res.status(500).json({ error: 'Failed to mark token as used' });
  }
}