import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

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

    const platformFee = totalTicketCount * 10;
    const finalAmount = totalCalculatedAmount - promoDiscount + platformFee;
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Verify Razorpay keys are present
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing. KEY_ID:', keyId ? 'present' : 'MISSING', 'SECRET:', keySecret ? 'present' : 'MISSING');
      throw new Error('Payment gateway not configured');
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: parseInt(finalAmount * 100, 10), // amount in paise
      currency: 'INR',
      receipt: transactionId,
    };

    try {
      const order = await razorpay.orders.create(options);
      
      return res.status(200).json({
        orderId: order.id,
        amount: finalAmount,
        currency: order.currency,
        reservations: reservations
      });
    } catch (apiErr) {
      console.error('Razorpay API Error:', JSON.stringify(apiErr));
      throw new Error('Payment gateway error: ' + (apiErr.error?.description || apiErr.message || 'Unknown'));
    }

  } catch (error) {
    console.error('Init Checkout Error:', error.message);
    res.status(400).json({ error: error.message || 'Failed to initialize checkout' });
  }
}
