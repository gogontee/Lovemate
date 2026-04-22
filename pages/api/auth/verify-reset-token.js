// pages/api/auth/verify-reset-token.js
import { verifyResetToken } from '../../../utils/resetToken';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const resetData = await verifyResetToken(token);
    
    if (resetData) {
      return res.status(200).json({ valid: true, email: resetData.email });
    } else {
      return res.status(200).json({ valid: false, error: 'Invalid or expired reset link' });
    }
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ error: 'Failed to verify token' });
  }
}