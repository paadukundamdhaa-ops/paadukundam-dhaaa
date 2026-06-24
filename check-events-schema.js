import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkEventsSchema() {
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.error("Error fetching event:", error);
  } else {
    console.log("Events Table Schema Keys:", Object.keys(data[0] || {}));
  }
}

checkEventsSchema();
