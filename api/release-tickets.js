import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reservations } = req.body;
  if (!reservations || !Array.isArray(reservations)) {
    return res.status(400).json({ error: 'Invalid reservations payload' });
  }
  
  try {
    for (const resId of reservations) {
      await supabase.rpc('release_tickets', { p_reservation_id: resId });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Release Tickets Error:", err);
    res.status(500).json({ error: 'Failed to release tickets' });
  }
}
