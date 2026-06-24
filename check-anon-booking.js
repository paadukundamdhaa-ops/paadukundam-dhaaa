import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBooking() {
  const { data, error } = await supabase.from('bookings').select('*, events(*), profiles(*)').limit(1);
  if (error) {
    console.error("Error fetching booking:", error);
  } else {
    console.log("Successfully fetched booking anon:", data);
  }
}

checkBooking();
