import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seedDatabase() {
  console.log("Starting database seed...");

  // 1. Seed Gallery Images
  const galleryImages = [
    { image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600", is_featured: true },
    { image_url: "https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80&w=600", is_featured: true },
    { image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600", is_featured: true },
    { image_url: "https://images.unsplash.com/photo-1533174000243-ea84bb301e74?auto=format&fit=crop&q=80&w=600", is_featured: true },
    { image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=600", is_featured: false },
    { image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600", is_featured: false },
    { image_url: "https://images.unsplash.com/photo-1464375117522-1314d6c469e1?auto=format&fit=crop&q=80&w=600", is_featured: false },
    { image_url: "https://images.unsplash.com/photo-1470229722913-7c090bf356c6?auto=format&fit=crop&q=80&w=600", is_featured: false }
  ];

  // Check if gallery is empty
  const { data: existingGallery } = await supabase.from('gallery').select('id').limit(1);
  if (!existingGallery || existingGallery.length === 0) {
    const { error: galleryError } = await supabase.from('gallery').insert(galleryImages);
    if (galleryError) console.error("Error seeding gallery:", galleryError);
    else console.log("Seeded gallery images.");
  } else {
    console.log("Gallery already seeded.");
  }

  // 2. Seed Ticket Tiers for existing events
  const { data: events, error: eventsError } = await supabase.from('events').select('id, title');
  if (eventsError) {
    console.error("Error fetching events:", eventsError);
    return;
  }

  for (const event of events) {
    const { data: existingTiers } = await supabase.from('ticket_tiers').select('id').eq('event_id', event.id).limit(1);
    
    if (!existingTiers || existingTiers.length === 0) {
      const isFree = event.title.toLowerCase().includes('free') || event.title.toLowerCase().includes('meetup');
      
      let tiers = [];
      if (isFree) {
        tiers = [
          { event_id: event.id, tier_name: "Free Admission", price: 0, total_capacity: 500, tickets_sold: 0, status: 'Active' }
        ];
      } else {
        tiers = [
          { event_id: event.id, tier_name: "General Admission", price: 999, total_capacity: 1000, tickets_sold: 0, status: 'Active' },
          { event_id: event.id, tier_name: "VIP Lounge", price: 4999, total_capacity: 200, tickets_sold: 0, status: 'Active' },
          { event_id: event.id, tier_name: "VVIP Meet & Greet", price: 14999, total_capacity: 50, tickets_sold: 0, status: 'Active' }
        ];
      }

      const { error: tierError } = await supabase.from('ticket_tiers').insert(tiers);
      if (tierError) console.error(`Error seeding tiers for event ${event.title}:`, tierError);
      else console.log(`Seeded ticket tiers for event: ${event.title}`);
    } else {
      console.log(`Ticket tiers already exist for event: ${event.title}`);
    }
  }

  console.log("Database seed complete!");
}

seedDatabase();
