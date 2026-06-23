import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Info, Star, ShieldCheck, Ticket, X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTicketModal, setShowTicketModal] = useState(false);

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEventData(data);
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);


  useEffect(() => {
    // Scroll immediately
    window.scrollTo(0, 0);
    // Override browser's aggressive history scroll restoration when using the back button
    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    return () => clearTimeout(scrollTimeout);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Event Details...</div>;
  }

  if (!eventData) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-black">Event Not Found</div>;
  }

  const d = new Date(eventData.event_date || Date.now());
  const formattedDate = isNaN(d.getTime()) ? 'TBA' : d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  const venueString = eventData.venue || 'TBA';
  const venueParts = venueString.split(',');
  const city = venueParts.length > 1 ? venueParts[venueParts.length - 1].trim() : venueString;

  // Mix real data with some placeholders for features we haven't built DB tables for yet
  const event = {
    title: eventData.title || "Untitled Event",
    date: formattedDate,
    time: eventData.event_time || "TBA",
    venue: venueString,
    city: city,
    description: eventData.description || "Join us for an unforgettable experience! More details coming soon.",
    heroImage: eventData.hero_image || eventData.img_url || "https://images.unsplash.com/photo-1540039155732-61ee14b12756?auto=format&fit=crop&q=80&w=2000",
    artist: {
      name: eventData.artist_name || "Featured Artist",
      image: eventData.artist_image || "https://images.unsplash.com/photo-1516280440502-6110f06a9284?auto=format&fit=crop&q=80&w=200",
      bio: eventData.artist_bio || "An incredible performance awaits you."
    },
    tickets: eventData.tickets || [
      { id: 1, name: "General Admission", price: 999, description: "Entry to standing arena.", available: true },
      { id: 2, name: "VIP Lounge", price: 4999, description: "Dedicated entry, front rows, and food.", available: true },
      { id: 3, name: "VVIP Meet & Greet", price: 14999, description: "Backstage access and photo ops.", available: false },
    ]
  };

  const mapEmbedUrl = eventData.map_url || `https://maps.google.com/maps?q=${encodeURIComponent(venueString + ', ' + city)}&output=embed`;

  const handleTicketChange = (ticketId, delta) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const newQty = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newQty };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((total, [ticketId, qty]) => {
    const ticket = event.tickets.find(t => t.id === parseInt(ticketId));
    return total + (ticket.price * qty);
  }, 0);

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        event: {
          id: eventData?.id,
          title: event.title,
          date: event.date,
          heroImage: event.heroImage,
          venue: event.venue,
          city: event.city
        },
        selectedTickets,
        totalPrice,
        totalTickets,
        allTicketsInfo: event.tickets
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[450px]">
        <img src={event.heroImage} className="w-full h-full object-cover" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        {/* Hero Title Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-6xl mx-auto z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Concert</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Live Music</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Left Column - Details */}
        <div className="lg:col-span-7 space-y-10">

          {/* Navigation & Actions (Moved to white space) */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <Link to="/events" className="flex items-center text-gray-500 hover:text-primary font-bold transition-colors">
              <ArrowLeft size={18} className="mr-2" /> Back to Events
            </Link>
            <button className="flex items-center text-gray-500 hover:text-primary font-bold transition-colors">
              <Share2 size={18} className="mr-2" /> Share Event
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-primary">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date & Time</p>
                <p className="font-bold text-gray-900 text-sm">{event.date} • {event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Location</p>
                <p className="font-bold text-gray-900 text-sm">{event.venue}, {event.city}</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">About the Event</h2>
            <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          </section>

          {/* Artist Section */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Artist</h2>
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50">
              <img src={event.artist.image} className="w-16 h-16 rounded-full object-cover shadow-sm" alt={event.artist.name} />
              <div>
                <h4 className="font-bold text-lg text-black">{event.artist.name}</h4>
                <p className="text-sm text-gray-500">{event.artist.bio}</p>
              </div>
            </div>
          </section>

          {/* Venue Map */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Venue</h2>
            <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
              <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
            </div>
          </section>

        </div>

        {/* Right Column - Ticket Selection */}
        <div className="lg:col-span-5 relative mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24 border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 bg-white">
            <h3 className="font-black text-xl text-black mb-4 border-b border-gray-100 pb-4">Select Tickets</h3>

            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {event.tickets.map(ticket => (
                <div key={ticket.id} className={`p-4 rounded-2xl border-2 transition-all ${selectedTickets[ticket.id] > 0 ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-base ${ticket.available ? 'text-black' : 'text-gray-400'}`}>{ticket.name}</h4>
                      <p className={`text-xs ${ticket.available ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.description}</p>
                    </div>
                    {!ticket.available && <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ml-2">Sold Out</span>}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className={`font-black text-lg ${ticket.available ? 'text-black' : 'text-gray-400'}`}>
                      ₹{ticket.price.toLocaleString()}
                    </div>

                    {ticket.available && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                        <button
                          onClick={() => handleTicketChange(ticket.id, -1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-primary font-bold hover:bg-gray-50 disabled:opacity-30 transition-colors"
                          disabled={!selectedTickets[ticket.id]}
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-sm font-black text-black">{selectedTickets[ticket.id] || 0}</span>
                        <button
                          onClick={() => handleTicketChange(ticket.id, 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-primary font-bold hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{totalTickets} Tickets Selected</span>
                <span className="text-xl font-black text-black">₹{totalPrice.toLocaleString()}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={totalTickets === 0}
                className="w-full flex items-center justify-center bg-primary disabled:bg-gray-300 hover:bg-primary-dark text-white font-black py-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
              >
                Proceed to Checkout <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
