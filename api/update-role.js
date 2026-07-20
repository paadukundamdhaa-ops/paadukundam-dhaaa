import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { email, role } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: role || 'admin' })
      .eq('email', email)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, updated: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
