import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  if (!process.env.VITE_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: 'Razorpay keys are missing in environment variables.' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID.replace(/['"]/g, '').trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.replace(/['"]/g, '').trim(),
    });

    const options = {
      amount: parseInt(amount, 10), // amount MUST be an integer in paisa
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    const errorMessage = error.error ? error.error.description : (error.message || JSON.stringify(error));
    res.status(500).json({ error: errorMessage });
  }
}
