import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Missing required field: amount' });
  }

  try {
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing.');
      throw new Error('Payment gateway not configured');
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const transactionId = `txn_bo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: parseInt(amount * 100, 10), // amount in paise
      currency: 'INR',
      receipt: transactionId,
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error('Checkout initialization error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during checkout initialization' });
  }
}
