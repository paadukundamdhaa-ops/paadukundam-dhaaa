import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, reservations } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay payment details' });
  }

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Signature is valid — confirm the reservations in the database
    const bookingsCreated = [];
    if (reservations && Array.isArray(reservations)) {
      for (const resId of reservations) {
        const { data: bookingId, error: confirmError } = await supabase.rpc('confirm_tickets', {
          p_reservation_id: resId,
          p_payment_id: razorpay_payment_id
        });
        
        if (confirmError) throw confirmError;

        const { data: bookingData } = await supabase
          .from('bookings')
          .select('booking_ref')
          .eq('id', bookingId)
          .single();

        bookingsCreated.push({
          id: bookingId,
          booking_ref: bookingData?.booking_ref
        });
      }
    }
    
    return res.status(200).json({ success: true, bookings: bookingsCreated });

  } catch (error) {
    console.error('Verify Payment Error:', error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
}
