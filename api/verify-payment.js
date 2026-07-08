import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transactionId, reservations } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: 'Missing transactionId' });
  }

  const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
  const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
  const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
  const phonepeEnv = process.env.PHONEPE_ENV || 'UAT';
  const baseUrl = phonepeEnv === 'PROD' 
    ? 'https://api.phonepe.com/apis/hermes' 
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  const checksum = crypto.createHash('sha256').update(`/pg/v1/status/${merchantId}/${transactionId}` + saltKey).digest('hex') + '###' + saltIndex;

  try {
    const response = await axios.get(`${baseUrl}/pg/v1/status/${merchantId}/${transactionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId
      }
    });

    if (response.data && response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
      const bookingsCreated = [];
      if (reservations && Array.isArray(reservations)) {
        for (const resId of reservations) {
          const { data: bookingId, error: confirmError } = await supabase.rpc('confirm_tickets', {
            p_reservation_id: resId,
            p_payment_id: transactionId
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
    } else {
      return res.status(400).json({ error: 'Payment failed or pending', details: response.data });
    }
  } catch (error) {
    console.error("DB Confirmation Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
}
