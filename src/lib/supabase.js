import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables. Please ensure .env is set up correctly.');
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE COMPLETELY SEPARATE SUPABASE CLIENTS WITH DIFFERENT storageKey VALUES
// This ensures User, Admin, and Scanner sessions NEVER share localStorage keys
// and are 100% isolated from each other.
// ─────────────────────────────────────────────────────────────────────────────

/** User panel client — for regular user login (email/password, Google, Apple) */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { storageKey: 'user-session' }
});

/** Admin panel client — for admin OTP login only */
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { storageKey: 'admin-session' }
});

/** Scanner client — for scanner OTP login only */
export const supabaseScanner = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { storageKey: 'scanner-session' }
});
