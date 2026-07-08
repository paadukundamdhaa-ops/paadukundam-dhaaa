import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    event_id, tier_id, qty, amount_paid, payment_method, 
    customer_name, customer_email, customer_phone, auto_checkin 
  } = req.body;

  if (!event_id || !tier_id || !qty || amount_paid === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: bookingId, error } = await supabase.rpc('issue_box_office_ticket', {
      p_event_id: event_id,
      p_tier_id: tier_id,
      p_qty: qty,
      p_amount: amount_paid,
      p_payment_method: payment_method || 'cash',
      p_customer_name: customer_name || '',
      p_customer_email: customer_email || '',
      p_customer_phone: customer_phone || '',
      p_auto_checkin: auto_checkin || false
    });

    if (error) throw error;

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('booking_ref')
      .eq('id', bookingId)
      .single();

    res.status(200).json({ 
      success: true, 
      bookingId, 
      bookingRef: bookingData?.booking_ref 
    });
  } catch (err) {
    console.error("Box Office Issue Ticket Error:", err.message);
    res.status(500).json({ error: 'Failed to issue ticket', details: err.message });
  }
}
