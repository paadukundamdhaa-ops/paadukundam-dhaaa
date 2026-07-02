import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Info, Star, ShieldCheck, Ticket, X, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedImage } from '../components/ProtectedImage';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle } = useAuth();
  
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [eventData, setEventData] = useState(null);
  const [ticketTiers, setTicketTiers] = useState([]);
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

        // Fetch ticket tiers for this event
        const { data: tiersData, error: tiersError } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('event_id', id)
          .eq('status', 'Active');
        
        if (tiersError) throw tiersError;
        if (tiersData) {
          const formattedTiers = tiersData.map(t => {
            const reserved = t.reserved_capacity || 0;
            const sold = t.tickets_sold || 0;
            const total = t.total_capacity || 0;
            const availableCount = Math.max(0, total - sold - reserved);
            
            return {
              id: t.id,
              name: t.tier_name,
              price: Number(t.price),
              description: `Total Capacity: ${t.total_capacity}`,
              availableCount: availableCount,
              available: availableCount > 0,
              originalTierData: t // Keep for reference
            };
          });
          setTicketTiers(formattedTiers);
        }

      } catch (err) {
        console.error("Error fetching event or tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();

    // Set up Realtime Subscription for Live Inventory Updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_tiers',
          filter: `event_id=eq.${id}`
        },
        (payload) => {
          // Update the ticket tiers array dynamically
          setTicketTiers((currentTiers) => {
            return currentTiers.map((tier) => {
              if (tier.id === payload.new.id) {
                const reserved = payload.new.reserved_capacity || 0;
                const sold = payload.new.tickets_sold || 0;
                const total = payload.new.total_capacity || 0;
                const availableCount = Math.max(0, total - sold - reserved);
                
                return {
                  ...tier,
                  availableCount: availableCount,
                  available: availableCount > 0,
                  originalTierData: payload.new
                };
              }
              return tier;
            });
          });
          
          // Also check if selected tickets exceed new limits and adjust downwards if needed
          setSelectedTickets((prev) => {
            let adjusted = { ...prev };
            let hasChanges = false;
            if (payload.new.id in adjusted) {
               const reserved = payload.new.reserved_capacity || 0;
               const sold = payload.new.tickets_sold || 0;
               const total = payload.new.total_capacity || 0;
               const availableCount = Math.max(0, total - sold - reserved);
               
               if (adjusted[payload.new.id] > availableCount) {
                  adjusted[payload.new.id] = availableCount;
                  hasChanges = true;
               }
            }
            return hasChanges ? adjusted : prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const isFreeEvent = (eventData.title || "").toLowerCase().includes("free") || (eventData.title || "").toLowerCase().includes("meetup");

  // Mix real data with some placeholders for features we haven't built DB tables for yet
  const event = {
    title: eventData.title || "Untitled Event",
    category: eventData.category || "Concert",
    date: formattedDate,
    time: eventData.event_time || "TBA",
    venue: venueString,
    city: city,
    shortDescription: eventData.short_description || "",
    description: eventData.description || "Join us for an unforgettable experience! More details coming soon.",
    heroImage: eventData.hero_image || eventData.img_url || "https://images.unsplash.com/photo-1540039155732-61ee14b12756?auto=format&fit=crop&q=80&w=2000",
    squareImage: eventData.square_image,
    artist: {
      name: eventData.artist_name || eventData.artist || "Featured Artist",
      image: eventData.artist_image || "https://images.unsplash.com/photo-1516280440502-6110f06a9284?auto=format&fit=crop&q=80&w=200",
      bio: eventData.artist_bio || "An incredible performance awaits you."
    },
    highlights: eventData.highlights || [],
    amenities: eventData.amenities || [],
    ageRestriction: eventData.age_restriction || "18+ Only",
    refundPolicy: eventData.refund_policy || "No Refunds",
    organizerName: eventData.organizer_name || "PaadukundamDhaa",
    organizerEmail: eventData.organizer_email || "support@paadukundamdhaa.com",
    tickets: ticketTiers.length > 0 ? ticketTiers : [] // using fetched tiers
  };

  const mapEmbedUrl = eventData.map_embed_url || eventData.map_url || `https://maps.google.com/maps?q=${encodeURIComponent(venueString + ', ' + city)}&output=embed`;

  const handleTicketChange = (ticketId, delta) => {
    setSelectedTickets(prev => {
      const ticket = event.tickets.find(t => t.id === ticketId);
      if (!ticket) return prev;
      
      const current = prev[ticketId] || 0;
      let newQty = Math.max(0, current + delta);
      
      if (newQty > ticket.availableCount) {
        newQty = ticket.availableCount;
      }
      
      return { ...prev, [ticketId]: newQty };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((total, [ticketId, qty]) => {
    const ticket = event.tickets.find(t => t.id === ticketId || String(t.id) === ticketId);
    if (!ticket) return total;
    return total + (ticket.price * qty);
  }, 0);

  const handleProceedToCheckout = () => {
    const checkoutState = {
      event: {
        id: eventData?.id,
        title: event.title,
        date: event.date,
        heroImage: event.heroImage,
        venue: event.venue,
        city: event.city,
        termsAndConditions: eventData?.terms_and_conditions
      },
      selectedTickets,
      totalPrice,
      totalTickets,
      allTicketsInfo: event.tickets
    };

    if (!user) {
      localStorage.setItem('pendingCheckout', JSON.stringify(checkoutState));
      setShowLoginModal(true);
    } else {
      navigate('/checkout', { state: checkoutState });
    }
  };

  const handleGoogleLogin = () => {
    signInWithGoogle('/checkout');
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <Helmet>
        <title>{event.title} Tickets | PaadukundamDhaa</title>
        <meta name="description" content={`Book tickets for ${event.title} live at ${event.venue}, ${event.city} on ${event.date}.`} />
        <meta property="og:title" content={`${event.title} - Live Concert`} />
        <meta property="og:description" content={`Book tickets for ${event.title} live at ${event.venue}, ${event.city} on ${event.date}.`} />
        <meta property="og:image" content={event.heroImage} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "${event.title}",
              "startDate": "${eventData.event_date || ''}",
              "location": {
                "@type": "Place",
                "name": "${event.venue}",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "${event.city}"
                }
              },
              "image": [
                "${event.heroImage}"
              ],
              "description": "${event.description.replace(/"/g, '\\"')}",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "INR",
                "lowPrice": "${event.tickets.length > 0 ? Math.min(...event.tickets.map(t => t.price)) : 0}",
                "availability": "https://schema.org/InStock"
              }
            }
          `}
        </script>
      </Helmet>

      {/* Hero Section */}
      <div className="relative w-full min-h-[300px] md:min-h-0" style={{ aspectRatio: '1920/900' }}>
        <ProtectedImage src={event.heroImage} className="absolute inset-0 w-full h-full object-cover object-top" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        {/* Hero Title Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 max-w-6xl mx-auto z-10 flex items-end gap-4 md:gap-8">
          {event.squareImage && (
            <div className="w-20 h-20 md:w-48 md:h-48 rounded-xl overflow-hidden shadow-2xl border-2 md:border-4 border-white/20 shrink-0 md:transform md:translate-y-8">
              <ProtectedImage src={event.squareImage} alt={event.title} className="w-full h-full object-cover" crossOrigin="anonymous"/>
            </div>
          )}
          <div className="pb-2 md:pb-4">
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-4">
              <span className="bg-primary text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{event.category}</span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Live Music</span>
            </div>
            <h1 className="text-2xl md:text-5xl font-black text-white mb-1 md:mb-2 leading-tight">{event.title}</h1>
          </div>
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
            <button 
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: event?.title || 'Event',
                      text: `Check out ${event?.title}!`,
                      url: window.location.href,
                    });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                } catch (error) {
                  console.log('Error sharing:', error);
                }
              }}
              className="flex items-center text-gray-500 hover:text-primary font-bold transition-colors"
            >
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
            {event.shortDescription && (
              <p className="text-lg font-medium text-gray-800 mb-4">{event.shortDescription}</p>
            )}
            <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          </section>

          {/* Highlights & Amenities */}
          {(event.highlights?.length > 0 || event.amenities?.length > 0) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {event.highlights?.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-black mb-4">Event Highlights</h2>
                  <ul className="space-y-2">
                    {event.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                        <Star size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {event.amenities?.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-black mb-4">Amenities</h2>
                  <ul className="space-y-2">
                    {event.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                        <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Artist Section */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Artist</h2>
            <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50">
              <ProtectedImage src={event.artist.image} className="w-16 h-16 rounded-full object-cover shadow-sm" alt={event.artist.name} />
              <div>
                <h4 className="font-bold text-lg text-black">{event.artist.name}</h4>
                <p className="text-sm text-gray-500">{event.artist.bio}</p>
              </div>
            </div>
          </section>

          {/* Venue Map */}
          <section>
            <h2 className="text-xl font-black text-black mb-4">Venue</h2>
            <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 mb-4">
              <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
            </div>
          </section>

          {/* Organizer & Policies */}
          <section className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black text-black mb-6">Policies & Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Age Restriction</h4>
                <p className="text-sm font-bold text-gray-900">{event.ageRestriction}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Refund Policy</h4>
                <p className="text-sm font-bold text-gray-900">{event.refundPolicy}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Organizer</h4>
                <p className="text-sm font-bold text-gray-900">{event.organizerName}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contact</h4>
                <a href={`mailto:${event.organizerEmail}`} className="text-sm font-bold text-primary hover:underline">{event.organizerEmail}</a>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column - Ticket Selection */}
        <div className="lg:col-span-5 relative mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24 border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/50 bg-white">
            
            {/* Visual Seat Map */}
            <h3 className="font-black text-xl text-black mb-4 border-b border-gray-100 pb-4">Seat Map</h3>
            <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center mb-6 relative">
              <div className="w-48 h-8 bg-black rounded-b-xl flex items-center justify-center text-white text-xs font-black tracking-widest uppercase mb-6 shadow-lg shadow-black/20">
                Stage
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[300px]">
                {/* Dynamically render blocks for each ticket tier as a "section" */}
                {event.tickets.map((ticket, index) => {
                  const isAvailable = ticket.available && ticket.availableCount > 0;
                  const colors = ['bg-primary/20 border-primary text-primary', 'bg-blue-500/20 border-blue-500 text-blue-600', 'bg-emerald-500/20 border-emerald-500 text-emerald-600', 'bg-purple-500/20 border-purple-500 text-purple-600'];
                  const colorClass = isAvailable ? colors[index % colors.length] : 'bg-gray-200 border-gray-300 text-gray-500';
                  
                  return (
                    <div 
                      key={ticket.id} 
                      className={`w-full py-4 rounded-xl border-2 flex flex-col items-center justify-center ${colorClass} transition-all cursor-pointer`}
                      onClick={() => {
                        if (isAvailable) handleTicketChange(ticket.id, 1);
                      }}
                    >
                      <span className="font-bold text-sm">{ticket.name}</span>
                      <span className="text-[10px] uppercase tracking-widest font-black mt-1">
                        {isAvailable ? `${ticket.availableCount} Left` : 'Sold Out'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <h3 className="font-black text-xl text-black mb-4 border-b border-gray-100 pb-4">Select Tickets</h3>

            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {event.tickets.map(ticket => {
                const isMaxReached = (selectedTickets[ticket.id] || 0) >= ticket.availableCount;
                return (
                <div key={ticket.id} className={`p-4 rounded-2xl border-2 transition-all ${selectedTickets[ticket.id] > 0 ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-base ${ticket.available ? 'text-black' : 'text-gray-400'}`}>{ticket.name}</h4>
                      <p className={`text-xs ${ticket.available ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.description}</p>
                      {ticket.available && ticket.availableCount > 0 && (
                         <p className="text-xs font-bold text-green-600 mt-1">{ticket.availableCount} Tickets Left</p>
                      )}
                      <p className="text-[10px] text-red-500 font-bold mt-1">* Non-refundable</p>
                    </div>
                    {!ticket.available && <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ml-2">Sold Out</span>}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className={`font-black text-lg ${ticket.available ? 'text-black' : 'text-gray-400'}`}>
                      {ticket.price === 0 ? 'Free' : `₹${ticket.price.toLocaleString()}`}
                    </div>

                    {ticket.available && (
                      <div className="flex flex-col items-end">
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
                            className="w-7 h-7 rounded flex items-center justify-center text-primary font-bold hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            disabled={isMaxReached}
                          >
                            +
                          </button>
                        </div>
                        {isMaxReached && selectedTickets[ticket.id] > 0 && (
                          <span className="text-[10px] text-orange-500 font-bold mt-1">Maximum available reached</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{totalTickets} Tickets Selected</span>
                <span className="text-xl font-black text-black">
                  {totalPrice === 0 && totalTickets > 0 ? 'Free' : `₹${totalPrice.toLocaleString()}`}
                </span>
              </div>
              
              {event.tickets.every(t => !t.available) ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center bg-gray-200 text-gray-500 font-black py-4 rounded-xl shadow-none cursor-not-allowed"
                >
                  SOLD OUT - Notify Me
                </button>
              ) : (
                <button
                  onClick={handleProceedToCheckout}
                  disabled={totalTickets === 0}
                  className="w-full flex items-center justify-center bg-primary disabled:bg-gray-300 hover:bg-primary-dark text-white font-black py-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                >
                  Proceed to Checkout <ChevronRight size={18} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Ticket size={32} />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">Login Required</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                You must be logged in to book tickets. Your selected tickets have been saved and you'll be redirected back to checkout immediately after logging in.
              </p>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              className="w-full bg-white text-gray-900 border border-gray-200 py-3 rounded-xl font-bold text-sm lg:text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
