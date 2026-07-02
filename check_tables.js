import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['platform_settings', 'cms_content', 'reservations', 'bookings', 'ticket_tiers', 'gallery'];
  
  for (const table of tables) {
    console.log(`\nChecking table: ${table}...`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`❌ Error querying ${table}:`, error.message);
    } else {
      console.log(`✅ Table ${table} exists! Columns found in the first row (or empty if no rows):`);
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]).join(', '));
      } else {
        // If empty, let's insert a dummy row then select it to get columns, then rollback?
        // Too complex. Let's just state it's empty.
        console.log(`(Table is empty, no rows to infer columns from)`);
      }
    }
  }
}

checkTables();
