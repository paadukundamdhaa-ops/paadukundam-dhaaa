import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
