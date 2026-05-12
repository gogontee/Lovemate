import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { data, error } = await supabaseAdmin
      .from('vote_transactions')
      .insert(req.body)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  
  if (req.method === 'PUT') {
    const { reference, updates } = req.body;
    const { data, error } = await supabaseAdmin
      .from('vote_transactions')
      .update(updates)
      .eq('reference', reference)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}