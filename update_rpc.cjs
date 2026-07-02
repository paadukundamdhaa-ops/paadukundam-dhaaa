const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const supabaseUrl = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_URL')).split('=')[1].trim();
const supabaseKey = env.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY')).split('=')[1].trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
CREATE OR REPLACE FUNCTION issue_box_office_ticket(
    p_event_id UUID,
    p_tier_id UUID,
    p_qty INT,
    p_amount DECIMAL,
    p_payment_method TEXT,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_auto_checkin BOOLEAN
) RETURNS UUID AS $$
DECLARE
    v_total_capacity INT;
    v_sold INT;
    v_reserved INT;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_ticket_idx INT;
    v_user_id UUID := NULL;
    v_checkin_qty INT := 0;
    v_checkin_status TEXT := 'pending';
BEGIN
    SELECT total_capacity, COALESCE(tickets_sold, 0), COALESCE(reserved_capacity, 0)
    INTO v_total_capacity, v_sold, v_reserved
    FROM ticket_tiers
    WHERE id = p_tier_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket tier not found';
    END IF;

    IF (v_total_capacity - v_sold - v_reserved) < p_qty THEN
        RAISE EXCEPTION 'Not enough available tickets in this tier';
    END IF;

    UPDATE ticket_tiers
    SET tickets_sold = COALESCE(tickets_sold, 0) + p_qty
    WHERE id = p_tier_id;
    
    UPDATE events
    SET tickets_sold = COALESCE(tickets_sold, 0) + p_qty
    WHERE id = p_event_id;

    v_booking_ref := '#BX-' || SUBSTRING(REPLACE(uuid_generate_v4()::text, '-', '') FROM 1 FOR 6);

    IF p_auto_checkin THEN
        v_checkin_qty := p_qty;
        v_checkin_status := 'checked_in';
    END IF;

    INSERT INTO bookings (
        booking_ref, user_id, event_id, ticket_tier_id, qty, total_amount, status, payment_method, checked_in_qty, check_in_status
    ) VALUES (
        UPPER(v_booking_ref), v_user_id, p_event_id, p_tier_id, p_qty, p_amount, 'Completed', p_payment_method, v_checkin_qty, v_checkin_status
    ) RETURNING id INTO v_booking_id;

    FOR v_ticket_idx IN 1..p_qty LOOP
        INSERT INTO tickets (
            booking_id, event_id, ticket_tier_id, qr_code_value, attendee_name, ticket_status
        ) VALUES (
            v_booking_id, p_event_id, p_tier_id, 
            UPPER(v_booking_ref) || '-' || v_ticket_idx || '-' || SUBSTRING(REPLACE(uuid_generate_v4()::text, '-', '') FROM 1 FOR 4),
            COALESCE(NULLIF(p_customer_name, ''), 'Walk-in Guest'),
            CASE WHEN p_auto_checkin THEN 'USED' ELSE 'VALID' END
        );
    END LOOP;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
  console.log(error ? error.message : 'SUCCESS');
}
run();
