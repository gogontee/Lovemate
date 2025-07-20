import { buffer } from 'micro';
import crypto from 'crypto';
import { supabase } from '@/utils/supabaseClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  const buf = await buffer(req);
  const sig = req.headers['x-paystack-signature'];

  const expectedSig = crypto
    .createHmac('sha512', secret)
    .update(buf)
    .digest('hex');

  // Verify signature
  if (sig !== expectedSig) {
    console.warn('Invalid webhook signature attempt:', sig);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload = JSON.parse(buf.toString());

  // Only respond to successful charges
  if (payload.event === 'charge.success') {
    const email = payload.data.customer.email;
    const amount = payload.data.amount / 100; // Convert kobo to naira
    const reference = payload.data.reference;

    // 1. Update user's wallet
    const { error: rpcError } = await supabase.rpc('fund_wallet_by_email', {
      user_email: email,
      amount_to_add: amount,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError.message);
      return res.status(500).json({ error: 'Failed to update wallet' });
    }

    // 2. Log transaction
    const { error: txError } = await supabase.from('transactions').insert([
      {
        user_email: email,
        amount: amount,
        reference: reference,
        type: 'wallet_funding',
        status: 'success',
      },
    ]);

    if (txError) {
      console.error('Transaction log error:', txError.message);
      // Don't fail the webhook just because logging failed
    }

    return res.status(200).json({ received: true });
  }

  // Unhandled event
  console.log('Unhandled Paystack event:', payload.event);
  return res.status(200).json({ status: 'ignored', event: payload.event });
}
