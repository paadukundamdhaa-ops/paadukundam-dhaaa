-- 1. Create the EVENTS table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue TEXT NOT NULL,
  status TEXT DEFAULT 'Upcoming', -- Live, Upcoming, Completed, Draft
  total_tickets INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  img_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the USERS table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Connects to Supabase Auth
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Active', -- Active, Inactive, Banned
  role TEXT DEFAULT 'User', -- User, Admin
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the TICKETS table (Pricing Tiers)
CREATE TABLE ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL, -- e.g., VIP, General Admission
  price DECIMAL(10, 2) NOT NULL,
  total_capacity INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the BOOKINGS table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL, -- e.g., #BK-1029
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_tier_id UUID REFERENCES ticket_tiers(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending', -- Completed, Pending, Failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create the GALLERY table
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create the PROMO CODES table
CREATE TABLE promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- if null, it applies to all events
  max_uses INTEGER DEFAULT 100,
  current_uses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active', -- Active, Inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some dummy data so the app isn't empty!
INSERT INTO events (title, artist, category, event_date, event_time, venue, status, total_tickets, tickets_sold, img_url)
VALUES 
  ('Arijit Singh Live', 'Arijit Singh', 'Concert', '2026-10-24', '19:00:00', 'Gachibowli Stadium, Hyderabad', 'Live', 5000, 4500, '/images/arijit.png'),
  ('The Local Train Tour', 'The Local Train', 'Indie Rock', '2026-11-12', '20:00:00', 'LB Stadium, Hyderabad', 'Upcoming', 3000, 1200, '/images/sunburn.png');
