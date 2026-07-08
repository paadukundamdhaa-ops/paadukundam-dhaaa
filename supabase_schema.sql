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

-- 7. Create the RESERVATIONS table (for ticket holds during checkout)
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_tier_id UUID REFERENCES ticket_tiers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending, Completed, Expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 8. Create database RPC functions

-- RPC: Reserve Tickets
CREATE OR REPLACE FUNCTION reserve_tickets(
  p_user_id UUID,
  p_event_id UUID,
  p_tier_id UUID,
  p_qty INTEGER,
  p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_capacity INTEGER;
  v_sold INTEGER;
  v_reserved INTEGER;
  v_available INTEGER;
  v_reservation_id UUID;
BEGIN
  -- Get capacity and tickets sold for the tier
  SELECT total_capacity, tickets_sold INTO v_capacity, v_sold
  FROM ticket_tiers
  WHERE id = p_tier_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket tier not found';
  END IF;

  -- Get active reservations (Pending and not expired)
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM reservations
  WHERE ticket_tier_id = p_tier_id
    AND status = 'Pending'
    AND expires_at > NOW();

  -- Calculate available tickets
  v_available := v_capacity - v_sold - v_reserved;

  IF p_qty > v_available THEN
    RAISE EXCEPTION 'Not enough tickets available. Remaining: %', v_available;
  END IF;

  -- Insert reservation
  INSERT INTO reservations (user_id, event_id, ticket_tier_id, quantity, amount, status, expires_at)
  VALUES (p_user_id, p_event_id, p_tier_id, p_qty, p_amount, 'Pending', NOW() + INTERVAL '10 minutes')
  RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Confirm Tickets
CREATE OR REPLACE FUNCTION confirm_tickets(
  p_reservation_id UUID,
  p_payment_id TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_event_id UUID;
  v_tier_id UUID;
  v_qty INTEGER;
  v_amount DECIMAL;
  v_status TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_booking_id UUID;
  v_booking_ref TEXT;
BEGIN
  -- Get reservation details
  SELECT user_id, event_id, ticket_tier_id, quantity, amount, status, expires_at
  INTO v_user_id, v_event_id, v_tier_id, v_qty, v_amount, v_status, v_expires_at
  FROM reservations
  WHERE id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  IF v_status != 'Pending' THEN
    RAISE EXCEPTION 'Reservation is not pending';
  END IF;

  IF v_expires_at < NOW() THEN
    RAISE EXCEPTION 'Reservation has expired';
  END IF;

  -- Generate unique booking reference (e.g. #BK-123456)
  v_booking_ref := '#BK-' || floor(random() * (999999-100000+1) + 100000)::text;

  -- Create booking
  INSERT INTO bookings (booking_ref, user_id, event_id, ticket_tier_id, qty, total_amount, status)
  VALUES (v_booking_ref, v_user_id, v_event_id, v_tier_id, v_qty, v_amount, 'Completed')
  RETURNING id INTO v_booking_id;

  -- Update tickets sold in tier
  UPDATE ticket_tiers
  SET tickets_sold = COALESCE(tickets_sold, 0) + v_qty
  WHERE id = v_tier_id;

  -- Update event tickets sold summary
  UPDATE events
  SET tickets_sold = COALESCE(tickets_sold, 0) + v_qty
  WHERE id = v_event_id;

  -- Update reservation status
  UPDATE reservations
  SET status = 'Completed'
  WHERE id = p_reservation_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Release Tickets
CREATE OR REPLACE FUNCTION release_tickets(
  p_reservation_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Mark reservation as Expired/Cancelled
  UPDATE reservations
  SET status = 'Expired'
  WHERE id = p_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
