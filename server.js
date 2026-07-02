import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Restrict CORS to known frontend origins only
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'https://paadukundam-dhaaa.vercel.app',
      'https://paadukundamdhaa.vercel.app',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json());

// Initialize Supabase Admin client (Requires Service Role Key for backend authority, or Anon Key if strictly using RPCs)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/init-checkout', async (req, res) => {
  // 'amount' is intentionally NOT trusted from frontend — calculated securely on backend
  const { eventId, selectedTickets, userId, promoCode } = req.body;

  if (!userId || !eventId || !selectedTickets) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // We expect the user to send selectedTickets as { tierId: quantity }
    let totalCalculatedAmount = 0;
    let totalTicketCount = 0;
    const reservations = [];

    // Atomically reserve tickets for each tier and calculate amount from DB (never trust frontend price)
    for (const [tierId, qty] of Object.entries(selectedTickets)) {
      if (qty > 0) {
        // Fetch real price from DB — frontend price is IGNORED
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

        // Call our secure RPC to reserve
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

    // Server-side promo code validation (client-side promo is only for display)
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

    // Add platform fee (₹15 per ticket) — calculated server-side
    const platformFee = totalTicketCount * 15;

    // Final amount is fully calculated on the backend — never from frontend
    const finalAmount = totalCalculatedAmount - promoDiscount + platformFee;
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const phonepeEnv = process.env.PHONEPE_ENV || 'UAT';
    const baseUrl = phonepeEnv === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes' 
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';

    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: parseInt(finalAmount * 100, 10), // in paise
      redirectUrl: `${frontendUrl}/payment-status`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${frontendUrl}/api/phonepe-callback`, // Not strictly used if we rely on redirect
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
          reservations: reservations // Send back reservation IDs to confirm later
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
    // If any reservation succeeded but a later one failed, we should ideally rollback.
    // In a real production system, the frontend would trigger release on error.
    res.status(400).json({ error: error.message || 'Failed to initialize checkout' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
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
      // Payment is legit! Confirm the reservations in database
      if (reservations && Array.isArray(reservations)) {
        for (const resId of reservations) {
          const { data: bookingId, error: confirmError } = await supabase.rpc('confirm_tickets', {
            p_reservation_id: resId,
            p_payment_id: transactionId
          });
          
          if (confirmError) throw confirmError;

          // Fetch the real booking_ref from DB so the frontend can use it
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
});

app.post('/api/release-tickets', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to release tickets' });
  }
});

// Admin: Issue Box Office Ticket (Bypasses PhonePe)
app.post('/api/admin/issue-ticket', async (req, res) => {
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

    // Fetch the generated booking ref
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
});


// Image Protection Proxy
app.get('/api/secure-image', async (req, res) => {
  const imageUrl = req.query.url;
  
  // Layer 13: Anti Hotlink Protection
  const referer = req.headers.referer || '';
  const origin = req.headers.origin || '';
  
  // Basic check to ensure it's loaded from our frontend domain 
  // (In production, replace with exact domain checks like 'https://paadukundamdhaa.com')
  if (process.env.NODE_ENV === 'production' && !referer.includes(process.env.FRONTEND_URL || 'localhost')) {
    return res.status(403).send('Hotlinking is strictly prohibited.');
  }

  if (!imageUrl) return res.status(400).send('URL required');

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Layer 14 & 21: Cache Protection & Security Headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:;");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(buffer);
  } catch (error) {
    res.status(404).send('Image not found or protected');
  }
});

app.post('/api/send-ticket', async (req, res) => {
  const { email, name, bookingRef, eventTitle, totalTickets, grandTotal, eventDate, eventTime, venue } = req.body;

  if (!email || !bookingRef || !eventTitle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set in .env. Mocking successful email send.");
    return res.status(200).json({ message: 'Email mocked successfully (configure .env to actually send)' });
  }

  const mailOptions = {
    from: `"Padukundam Raa Ticketing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Tickets for ${eventTitle} are Confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="color: #111827; margin-top: 0; font-size: 24px;">Booking Confirmed!</h1>
          <p style="color: #4b5563; font-size: 16px;">Hi ${name},</p>
          <p style="color: #4b5563; font-size: 16px;">Thank you for booking with us. Your tickets for <strong>${eventTitle}</strong> are confirmed.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: bold;">Booking Reference</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #111827; font-family: monospace;">${bookingRef}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Date & Time</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${eventDate} at ${eventTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Venue</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${venue}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Tickets</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: bold; text-align: right;">${totalTickets} Ticket(s)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Total Paid</td>
              <td style="padding: 10px 0; color: #111827; font-weight: bold; text-align: right; font-size: 18px;">₹${grandTotal.toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://paadukundam-dhaaa.vercel.app/ticket/${bookingRef}?download=true" style="display: inline-block; padding: 12px 24px; background-color: #8c1c24; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Download Your Ticket (JPG)</a>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; margin-top: 24px;">You can also view and download your full digital ticket by logging into your account dashboard.</p>
          
          <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


// ─── Scanner Login ───────────────────────────────────────────────────────────
// Credentials live in .env (SCANNER_USERNAME, SCANNER_PASSWORD) — NOT in source code
app.post('/api/scanner-login', (req, res) => {
  const { username, password } = req.body;
  const validUsername = process.env.SCANNER_USERNAME || 'scanner';
  const validPassword = process.env.SCANNER_PASSWORD;

  if (!validPassword) {
    console.error('SCANNER_PASSWORD not set in .env');
    return res.status(503).json({ error: 'Scanner login is not configured. Set SCANNER_PASSWORD in your .env file.' });
  }

  if (username === validUsername && password === validPassword) {
    // Return a server-generated token so nothing sensitive lives in client JS
    const token = crypto
      .createHmac('sha256', validPassword)
      .update(`scanner_${Date.now()}`)
      .digest('hex');
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

// ─── Increment Promo Code Usage ───────────────────────────────────────────────
// Called by PaymentStatus after successful booking if a promo code was applied
app.post('/api/increment-promo-usage', async (req, res) => {
  const { promoCodeId } = req.body;
  if (!promoCodeId) return res.status(400).json({ error: 'Missing promoCodeId' });

  try {
    const { data: promo, error: fetchErr } = await supabase
      .from('promo_codes')
      .select('current_uses')
      .eq('id', promoCodeId)
      .single();

    if (fetchErr || !promo) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    const { error: updateErr } = await supabase
      .from('promo_codes')
      .update({ current_uses: (promo.current_uses || 0) + 1 })
      .eq('id', promoCodeId);

    if (updateErr) throw updateErr;

    res.json({ success: true });
  } catch (err) {
    console.error('Promo usage increment error:', err);
    res.status(500).json({ error: 'Failed to update promo usage' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
