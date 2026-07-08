import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  const validUsername = process.env.SCANNER_USERNAME || 'scanner';
  const validPassword = process.env.SCANNER_PASSWORD;

  if (!validPassword) {
    console.error('SCANNER_PASSWORD not set in environment variables');
    return res.status(503).json({ error: 'Scanner login is not configured. Set SCANNER_PASSWORD in your environment variables.' });
  }

  if (username === validUsername && password === validPassword) {
    const token = crypto
      .createHmac('sha256', validPassword)
      .update(`scanner_${Date.now()}`)
      .digest('hex');
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
}
