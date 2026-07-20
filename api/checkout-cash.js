import { createClient } from '@supabase/supabase-js';

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
    let appliedPromoId = null;
    let appliedPromoCode = null;
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
          appliedPromoId = promo.id;
          appliedPromoCode = promo.code;
        }
      }
    }

    const platformFee = totalTicketCount * 10;
    const finalAmount = totalCalculatedAmount - promoDiscount + platformFee;
    const transactionId = `CASH_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const bookingsCreated = [];
    // Confirm the reservations immediately as CASH
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

    res.status(200).json({
      success: true,
      bookings: bookingsCreated,
      amount: finalAmount,
      totalTickets: totalTicketCount,
      bookingFee: platformFee,
      promoDiscountAmount: promoDiscount,
      subtotalBeforeDiscount: totalCalculatedAmount,
      appliedPromo: appliedPromoId ? { id: appliedPromoId, code: appliedPromoCode } : null
    });

  } catch (error) {
    console.error("Cash Checkout Error:", error);
    res.status(400).json({ error: error.message || 'Failed to complete cash checkout' });
  }
}
