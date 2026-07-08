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

  const { eventId, selectedTickets, userId, promoCode } = req.body;

  if (!userId || !eventId || !selectedTickets) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let totalCalculatedAmount = 0;
    let totalTicketCount = 0;
    const reservations = [];

    // Atomically reserve tickets for each tier and calculate amount
    for (const [tierId, qty] of Object.entries(selectedTickets)) {
      if (qty > 0) {
        const { data: tierInfo, error: tierError } = await supabase
          .from('ticket_tiers')
          .select('price')
          .eq('id', tierId)
          .single();
          
        if (tierError || !tierInfo) {
           throw new Error(`Invalid ticket tier: ${tierId}`);
        }
        
        const tierAmount = tierInfo.price * qty;
        totalCalculatedAmount += tierAmount;
        totalTicketCount += qty;

        const { data: reservationId, error: rpcError } = await supabase.rpc('reserve_tickets', {
          p_user_id: userId,
          p_event_id: eventId,
          p_tier_id: tierId,
          p_qty: qty,
          p_amount: tierAmount
        });

        if (rpcError) {
          throw new Error(`Failed to reserve tickets: ${rpcError.message}`);
        }
        
        reservations.push(reservationId);
      }
    }

    let promoDiscount = 0;
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('status', 'Active')
        .single();

      if (promo) {
        const appliesToEvent = !promo.event_id || promo.event_id === eventId;
        const underLimit = !promo.max_uses || (promo.current_uses || 0) < promo.max_uses;
        if (appliesToEvent && underLimit) {
          promoDiscount = Math.floor((totalCalculatedAmount * promo.discount_percentage) / 100);
        }
      }
    }

    const platformFee = totalTicketCount * 15;
    const finalAmount = totalCalculatedAmount - promoDiscount + platformFee;
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const phonepeEnv = process.env.PHONEPE_ENV || 'UAT';
    const baseUrl = phonepeEnv === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes' 
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'https://paadukundam-dhaaa.vercel.app';

    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: parseInt(finalAmount * 100, 10), // in paise
      redirectUrl: `${frontendUrl}/payment-status`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${frontendUrl}/api/phonepe-callback`, 
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = crypto.createHash('sha256').update(payloadBase64 + '/pg/v1/pay' + saltKey).digest('hex') + '###' + saltIndex;

    try {
      const response = await axios.post(`${baseUrl}/pg/v1/pay`, {
        request: payloadBase64
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      });

      if (response.data && response.data.success) {
        res.status(200).json({
          transactionId: transactionId,
          amount: finalAmount,
          redirectInfo: response.data.data.instrumentResponse.redirectInfo,
          reservations: reservations 
        });
      } else {
        throw new Error(response.data.message || 'PhonePe init failed');
      }
    } catch (apiErr) {
      console.error("PhonePe API Error:", apiErr.response ? apiErr.response.data : apiErr.message);
      throw new Error('Payment gateway error');
    }

  } catch (error) {
    console.error("Init Checkout Error:", error);
    res.status(400).json({ error: error.message || 'Failed to initialize checkout' });
  }
}
