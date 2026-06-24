import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function insertDummyEvent() {
  const dummyEvent1 = {
    title: "Open Source Tech Meetup",
    artist: "Tech Community Leaders",
    category: "Tech & Networking",
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    event_time: "18:00:00",
    venue: "Innovation Hub, Bangalore",
    status: "Confirmed",
    total_tickets: 500,
    tickets_sold: 0,
    img_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
  };

  const dummyEvent2 = {
    title: "Local Art Exhibition - Free Entry",
    artist: "Local Artists",
    category: "Art & Culture",
    event_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    event_time: "10:00:00",
    venue: "City Gallery, Mumbai",
    status: "Confirmed",
    total_tickets: 1000,
    tickets_sold: 0,
    img_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800"
  };

  const { data, error } = await supabase.from('events').insert([dummyEvent1, dummyEvent2]).select();
  if (error) {
    console.error("Error inserting events:", error);
  } else {
    console.log("Successfully inserted events:", data.map(e => e.title).join(", "));
  }
}

insertDummyEvent();
