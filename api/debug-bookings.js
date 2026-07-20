import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    return res.status(200).json({ success: true, count: data.length, bookings: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
