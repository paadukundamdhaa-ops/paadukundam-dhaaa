const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function fix() {
  const { data, error } = await supabase
    .from('events')
    .update({ event_date: '2026-08-10' })
    .eq('id', '51fdc075-8d4e-4af8-8995-4ff769327d6f');
  console.log('Update Error:', error);
  console.log('Update Data:', data);
}
fix();
