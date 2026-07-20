import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Starting forced database wipe of old events...");
    
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, title')
      .neq('title', 'Razorpay Live Testing Event');

    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      return res.status(200).json({ message: 'No events found to delete. The database is already clean!' });
    }

    const deletedTitles = [];
    for (const e of events) {
      console.log(`Deleting: ${e.title} (${e.id})`);
      
      await supabase.from('reservations').delete().eq('event_id', e.id);
      
      const { data: bookings } = await supabase.from('bookings').select('id').eq('event_id', e.id);
      if (bookings && bookings.length > 0) {
        const bIds = bookings.map(b => b.id);
        await supabase.from('tickets').delete().in('booking_id', bIds);
      }
      
      await supabase.from('bookings').delete().eq('event_id', e.id);
      await supabase.from('ticket_tiers').delete().eq('event_id', e.id);
      await supabase.from('promo_codes').delete().eq('event_id', e.id);
      await supabase.from('gallery').delete().eq('event_id', e.id);
      
      const { error: finalErr } = await supabase.from('events').delete().eq('id', e.id);
      if (finalErr) throw finalErr;
      
      deletedTitles.push(e.title);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully wiped all old events and associated data!',
      deletedEvents: deletedTitles,
      keptEvent: 'Razorpay Live Testing Event'
    });

  } catch (error) {
    console.error("Wipe failed:", error);
    return res.status(500).json({ error: 'Failed to wipe database', details: error.message || error });
  }
}
