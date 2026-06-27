import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Clock, ArrowRight, Heart, ShieldCheck, Zap, Ticket, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Music, Users, Smile, GraduationCap, Crown, Ticket as TicketIcon, Disc, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeFaq, setActiveFaq] = useState(null);
  
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [heroSettings, setHeroSettings] = useState({
    heading: 'FEEL THE RHYTHM LIVE THE MUSIC',
    subheading: 'Discover and instantly book tickets for the most exciting live concerts happening around you. Secure your spot in seconds.',
    bgImages: ['/images/sunburn.png', '', '', '']
  });
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const validBgImages = (heroSettings.bgImages || []).filter(img => img && img.trim() !== '');

  useEffect(() => {
    let timer;
    if (validBgImages.length > 1) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % validBgImages.length);
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [validBgImages.length]);
  const [tickerSettings, setTickerSettings] = useState([
    'Early Bird Tickets for Sunburn 2026 are Live!',
    'Arijit Singh Live - 50% Sold Out!',
    "Use code 'PDHAA10' for 10% off your first booking",
    'The Local Train reunion tour announced'
  ]);

  const [stats, setStats] = useState([
    { label: 'Stat 1', val: '500+', desc: 'Concerts Hosted' },
    { label: 'Stat 2', val: '2M+', desc: 'Tickets Sold' },
    { label: 'Stat 3', val: '1M+', desc: 'Happy Customers' },
    { label: 'Stat 4', val: '25+', desc: 'Cities Covered' },
  ]);

  const [testimonials, setTestimonials] = useState([
    { name: 'Riya Sharma', text: 'Amazing experience! The booking process was smooth and the concert was beyond expectations.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { name: 'Aman Verma', text: 'Best platform for concert tickets. Quick confirmation and easy entry with QR!', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
    { name: 'Neha Kapoor', text: 'Loved the UI and how easy it is to find events. Highly recommended!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  ]);

  const faqs = [
    {
      question: "How do I receive my tickets after booking?",
      answer: "Once your payment is successful, you will instantly receive an email with your e-ticket and a unique QR code. You can also access your tickets anytime in the 'My Bookings' section of your account."
    },
    {
      question: "Are the tickets refundable or transferable?",
      answer: "Tickets are non-refundable unless the event is cancelled by the organizer. However, you can transfer your tickets to a friend via the 'Transfer Ticket' option in your dashboard up to 24 hours before the event."
    },
    {
      question: "What time do the gates open for concerts?",
      answer: "Gates typically open 2 to 3 hours before the main act begins. Please check your specific event ticket for exact gate opening times and early entry privileges."
    },
    {
      question: "Do I need to carry a physical printout of my ticket?",
      answer: "No, we support 100% paperless entry! Just show the QR code on your mobile device at the entry gates along with a valid Government ID."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  useEffect(() => {
    let timer;
    
    if (featuredEvents && featuredEvents.length > 0) {
      // Find the next upcoming event
      const now = new Date();
      const upcomingEvents = featuredEvents
        .map(e => ({
          ...e,
          fullDate: new Date(`${e.rawDate}T${e.rawTime || '00:00:00'}`)
        }))
        .filter(e => e.fullDate > now)
        .sort((a, b) => a.fullDate - b.fullDate);
        
      if (upcomingEvents.length > 0) {
        const nextEventTime = upcomingEvents[0].fullDate.getTime();
        
        timer = setInterval(() => {
          const currentTime = new Date().getTime();
          const distance = nextEventTime - currentTime;
          
          if (distance <= 0) {
            clearInterval(timer);
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          } else {
            setTimeLeft({
              days: Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
          }
        }, 1000);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [featuredEvents]);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e) => e.preventDefault();
    
    // Prevent screenshot shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' || 
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key === 's')) ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  useEffect(() => {
    const fetchHomeEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, ticket_tiers(price)')
          .in('status', ['Live', 'Upcoming', 'Active', 'Confirmed'])
          .order('event_date', { ascending: true })
          .limit(8);

        if (error) throw error;
        
        if (data) {
          const formattedEvents = data.map(event => {
            const d = new Date(event.event_date);
            const lowestPrice = event.ticket_tiers && event.ticket_tiers.length > 0 
              ? Math.min(...event.ticket_tiers.map(t => t.price || 0)) 
              : 0;
            return {
              id: event.id,
              title: event.title,
              date: d.getDate().toString().padStart(2, '0'),
              month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
              rawDate: event.event_date,
              rawTime: event.event_time,
              venue: event.venue,
              price: lowestPrice,
              img: event.img_url || '/images/arijit.png'
            };
          });
          setFeaturedEvents(formattedEvents);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        if (data) {
          const groups = {};
          data.forEach(img => {
            const eId = img.event_id || 'other';
            if (!groups[eId]) {
              groups[eId] = {
                id: eId,
                title: img.event_title || 'Other Moments',
                coverImage: img.image_url,
                count: 0
              };
            }
            groups[eId].count += 1;
          });
          setGalleryImages(Object.values(groups).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }
    };

    const fetchCMS = async () => {
      try {
        const { data, error } = await supabase.from('cms_content').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          const hero = data.find(d => d.section_name === 'hero');
          const statsData = data.find(d => d.section_name === 'stats');
          const testData = data.find(d => d.section_name === 'testimonials');
          const tickerData = data.find(d => d.section_name === 'ticker');
          
          if (hero && hero.content_data) {
            setHeroSettings({
              heading: hero.content_data.heading || 'FEEL THE RHYTHM LIVE THE MUSIC',
              subheading: hero.content_data.subheading || 'Discover and instantly book tickets for the most exciting live concerts happening around you. Secure your spot in seconds.',
              bgImages: hero.content_data.bgImages || ['/images/sunburn.png', '', '', '']
            });
          }
          if (statsData && statsData.content_data) setStats(statsData.content_data);
          if (testData && testData.content_data) setTestimonials(testData.content_data);
          if (tickerData && tickerData.content_data) setTickerSettings(tickerData.content_data);
        }
      } catch (err) {
        console.error('Error fetching CMS:', err);
      }
    };

    fetchHomeEvents();
    fetchGallery();
    fetchCMS();

    // Listen for cross-tab localStorage changes (from AdminHomeCMS)
    window.addEventListener('storage', fetchCMS);

    // Supabase Realtime subscriptions
    const eventsSubscription = supabase.channel('public:events-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {
        fetchHomeEvents();
      })
      .subscribe();

    const gallerySubscription = supabase.channel('public:gallery-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, payload => {
        fetchGallery();
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', fetchCMS);
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(gallerySubscription);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen text-black font-sans">
      <Helmet>
        <title>PaadukundamDhaa | Home of Live Concerts</title>
        <meta name="description" content="Discover and instantly book tickets for the most exciting live concerts happening around you. Secure your spot in seconds." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PaadukundamDhaa",
              "url": "https://paadukundamdhaa.com",
              "logo": "https://paadukundamdhaa.com/favicon.png",
              "sameAs": [
                "https://www.instagram.com/paadukundamdhaa"
              ]
            }
          `}
        </script>
      </Helmet>
      
      {/* ULTRA-PREMIUM HERO SECTION */}
      <section className="bg-[#0a0a0a] text-white relative pt-32 pb-20 min-h-[90vh] flex items-center border-b border-white/10 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0 bg-black">
          {validBgImages.length > 1 ? (
            validBgImages.map((img, idx) => (
              <motion.img 
                key={idx}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: idx === currentSlide ? 0.4 : 0, 
                  scale: idx === currentSlide ? 1.05 : 1 
                }}
                transition={{ opacity: { duration: 1.5 }, scale: { duration: 10 } }}
                src={img} 
                alt={`Concert Background ${idx + 1}`} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            ))
          ) : (
            <motion.img 
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
              src={validBgImages[0] || "/images/sunburn.png"} 
              alt="Concert" 
              className="w-full h-full object-cover opacity-40" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>
        
        {/* Hero Content */}
        {/* Floating Particles/Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Abstract Ticket 1 */}
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[10%] opacity-20"
          >
            <TicketIcon size={64} className="text-secondary" />
          </motion.div>
          {/* Abstract Music Note */}
          <motion.div 
            animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-[45%] opacity-10"
          >
            <Music size={96} className="text-primary" />
          </motion.div>
          {/* Glowing Orb */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]"
          ></motion.div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text (7 cols) */}
          <div className="lg:col-span-7">
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-secondary font-bold mb-4 tracking-widest text-sm uppercase drop-shadow-[0_0_10px_rgba(245,198,36,0.8)]"
            >
              Feel the Beat. Live the Moment.
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] uppercase drop-shadow-2xl"
            >
              {heroSettings.heading.split(' ').slice(0, 3).join(' ')}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-200 drop-shadow-[0_0_15px_rgba(245,198,36,0.5)]">
                {heroSettings.heading.split(' ').slice(3).join(' ') || 'LIKE NEVER BEFORE'}
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="text-pale mb-10 max-w-xl text-lg md:text-xl font-light"
            >
              {heroSettings.subheading}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
            >
              <Link to="/events" className="w-full sm:w-auto bg-gradient-to-r from-secondary to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black px-10 py-4 rounded-full font-black text-lg transition-all shadow-[0_0_20px_rgba(245,198,36,0.4)] hover:shadow-[0_0_30px_rgba(245,198,36,0.6)] flex items-center justify-center transform hover:-translate-y-1">
                Book Tickets <TicketIcon size={20} className="ml-2" />
              </Link>
              <Link to="/events" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-black px-10 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center backdrop-blur-sm">
                Explore Events <ArrowRight size={20} className="ml-2" />
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium"
            >
              <div className="flex items-center"><ShieldCheck size={18} className="text-secondary mr-2" /> Secure Payments</div>
              <div className="flex items-center"><Zap size={18} className="text-secondary mr-2" /> Instant Booking</div>
              <div className="flex items-center"><TicketIcon size={18} className="text-secondary mr-2" /> QR Code Entry</div>
            </motion.div>

            {/* Countdown Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 border border-white/20 bg-white/5 backdrop-blur-md p-6 rounded-2xl inline-block shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <p className="text-xs font-bold tracking-widest text-secondary mb-4 uppercase text-center flex items-center justify-center">
                <Clock size={14} className="mr-2"/> Next Big Concert In
              </p>
              <div className="flex space-x-6">
                {[
                  { label: 'DAYS', value: timeLeft.days },
                  { label: 'HOURS', value: timeLeft.hours },
                  { label: 'MINS', value: timeLeft.minutes },
                  { label: 'SECS', value: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{String(item.value).padStart(2, '0')}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Featured Card (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="relative border border-white/20 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500">
              
              {/* Premium Glow effect behind card */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/30 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-[80px]"></div>

              <div className="absolute top-4 right-4 bg-gradient-to-r from-secondary to-yellow-600 text-black text-xs font-black px-4 py-1.5 rounded-full z-20 shadow-lg flex items-center">
                <Star size={12} className="mr-1 fill-black" /> FEATURED EVENT
              </div>

              <div className="relative h-64 overflow-hidden">
                <img src={featuredEvents[0]?.img || "/images/script.png"} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Featured</span>
                </div>
              </div>
              
              <div className="p-8 pt-4 text-left relative z-10">
                <h3 className="text-4xl font-black mb-1 tracking-tight text-white drop-shadow-md">{featuredEvents[0]?.title || "LIVE CONCERT"}</h3>
                <p className="text-secondary font-bold tracking-widest text-xs uppercase mb-6 drop-shadow-md">Live In Concert</p>
                
                <div className="space-y-3 text-sm text-gray-300 mb-6 font-medium border-b border-white/10 pb-6">
                  <div className="flex items-center"><Calendar size={16} className="mr-3 text-secondary shrink-0" /> {featuredEvents[0]?.date} {featuredEvents[0]?.month} 2026</div>
                  <div className="flex items-center"><MapPin size={16} className="mr-3 text-secondary shrink-0" /> {featuredEvents[0]?.venue || "Dome, NSCI, Mumbai"}</div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Starting From</p>
                    <p className="text-2xl font-black text-white">
                      {featuredEvents[0]?.price === 0 ? 'Free' : `₹${featuredEvents[0]?.price?.toLocaleString('en-IN') || '0'}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Available</span>
                  </div>
                </div>

                <Link to={featuredEvents[0] ? `/events/${featuredEvents[0].id}` : '/events'} className="w-full bg-primary hover:bg-red-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center shadow-[0_0_15px_rgba(192,0,0,0.5)]">
                  Book Now <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NEWS TICKER */}
      <div className="bg-primary text-white py-3 flex overflow-hidden border-b border-gray-200 relative">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex whitespace-nowrap font-bold tracking-wider uppercase text-sm items-center w-max"
        >
          {/* First Group */}
          <div className="flex space-x-12 items-center px-6">
            <span className="flex items-center"><Star size={14} className="mr-2 text-secondary" /> {tickerSettings[0]}</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-secondary" /> {tickerSettings[1]}</span>
            <span className="flex items-center"><TicketIcon size={14} className="mr-2 text-secondary" /> {tickerSettings[2]}</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-secondary" /> {tickerSettings[3]}</span>
          </div>
          {/* Duplicate Group for Seamless Looping */}
          <div className="flex space-x-12 items-center px-6">
            <span className="flex items-center"><Star size={14} className="mr-2 text-secondary" /> {tickerSettings[0]}</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-secondary" /> {tickerSettings[1]}</span>
            <span className="flex items-center"><TicketIcon size={14} className="mr-2 text-secondary" /> {tickerSettings[2]}</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-secondary" /> {tickerSettings[3]}</span>
          </div>
        </motion.div>
      </div>

      {/* FEATURED EVENTS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3"></div>
              <h2 className="text-black text-2xl font-black uppercase tracking-wider">Featured Events</h2>
            </div>
            <Link to="/events" className="text-primary font-semibold text-sm flex items-center hover:underline">
              View All Events <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pb-8">
            {featuredEvents.slice(0, 5).map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden relative group block hover:border-primary hover:shadow-xl transition-all">
                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-primary text-white text-center w-12 h-12 flex flex-col justify-center rounded-md z-10 shadow-lg">
                  <span className="text-lg font-black leading-none">{event.date}</span>
                  <span className="text-[10px] uppercase font-bold">{event.month}</span>
                </div>
                {/* Heart */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white z-10" onClick={(e) => e.preventDefault()}><Heart size={20} /></button>
                
                <div className="h-48 overflow-hidden">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate text-black">{event.title}</h3>
                  <p className="text-gray-600 text-xs mb-4 truncate">{event.venue}</p>
                  <p className="font-semibold text-sm text-black">From ₹{event.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* WHY CHOOSE US */}
      <section className="bg-gray-50 py-16 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-10">
            <div className="w-1.5 h-6 bg-primary mr-3"></div>
            <h2 className="text-black text-2xl font-black uppercase tracking-wider">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { icon: <ShieldCheck size={32} />, title: 'Secure Booking', sub: '100% Safe & Secure' },
              { icon: <Zap size={32} />, title: 'Instant Confirmation', sub: 'Get Tickets Instantly' },
              { icon: <Ticket size={32} />, title: 'QR Code Entry', sub: 'Easy & Contactless' },
              { icon: <Star size={32} />, title: 'Verified Events', sub: 'Genuine & Trusted' },
              { icon: <Users size={32} />, title: '24×7 Support', sub: "We're Here Anytime" },
              { icon: <Clock size={32} />, title: 'Fast Checkout', sub: 'Book In Just Few Clicks' },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="text-secondary mb-4">{feature.icon}</div>
                <h4 className="text-black font-bold text-sm mb-1">{feature.title}</h4>
                <p className="text-gray-600 text-[10px] uppercase tracking-wider">{feature.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING CONCERTS TIMELINE */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-16">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3 shrink-0"></div>
              <h2 className="text-black text-xl md:text-2xl font-black uppercase tracking-wider leading-tight">Upcoming Concerts</h2>
            </div>
            <Link to="/events" className="text-primary font-semibold text-sm hover:underline whitespace-nowrap shrink-0">View All</Link>
          </div>

          <div className="relative flex justify-between items-center overflow-x-auto hide-scrollbar pb-8">
            {/* Red Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -z-10 hidden md:block"></div>
            
            {featuredEvents.slice(0, 5).map((event, idx, arr) => (
              <div key={idx} className="flex items-center">
                <Link to={`/events/${event.id}`} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center min-w-[260px] mx-2 relative group hover:border-primary hover:shadow-xl transition-all cursor-pointer">
                  <div className="text-center pr-4 border-r border-gray-200 mr-4">
                    <span className="block text-3xl font-black text-primary leading-none">{event.date}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase">{event.month}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-black text-sm mb-1 truncate">{event.title}</h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">{event.venue}</p>
                    <div className="text-[10px] text-primary font-bold uppercase flex items-center group-hover:underline">Book Now <ArrowRight size={10} className="ml-1" /></div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 rounded-full bg-white border-4 border-primary hidden md:block"></div>
                </Link>
                {/* Arrow between cards */}
                {idx < arr.length - 1 && (
                  <div className="hidden md:flex items-center text-primary/40 px-2 shrink-0">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTIST SPOTLIGHT */}
      <section 
        className="py-20 relative bg-cover bg-center bg-fixed" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/85"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3 shrink-0"></div>
              <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-wider leading-tight">Artist Spotlight</h2>
            </div>
            <div className="flex space-x-2 shrink-0">
              <button className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 text-white transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Featured Artist */}
            {featuredEvents.length > 0 ? (
              <>
                <div className="lg:w-1/2 flex flex-col md:flex-row gap-6">
                  <img src={featuredEvents[0].img} alt={featuredEvents[0].title} className="w-full md:w-64 h-64 object-cover rounded-xl" />
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-3xl text-white font-black mr-3">{featuredEvents[0].title}</h3>
                      <span className="bg-secondary text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                      Get ready for an unforgettable night filled with amazing music and magical moments. Book your tickets before they run out!
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="border border-white/30 text-gray-300 px-3 py-1 text-xs rounded-full">Featured</span>
                      <span className="border border-white/30 text-gray-300 px-3 py-1 text-xs rounded-full">Concert</span>
                    </div>
                    <Link to={`/events/${featuredEvents[0].id}`} className="inline-block bg-primary text-white font-bold px-6 py-2 rounded hover:bg-red-700 transition-colors">Book Now</Link>
                  </div>
                </div>

                {/* Other Artists */}
                <div className="lg:w-1/2 flex space-x-4 overflow-x-auto hide-scrollbar pb-4 mt-8 lg:mt-0">
                  {featuredEvents.slice(1, 5).map((artist, idx) => (
                    <Link to={`/events/${artist.id}`} key={idx} className="relative rounded-xl overflow-hidden h-64 min-w-[200px] sm:min-w-[240px] group cursor-pointer border border-white/20 shadow-lg block shrink-0">
                      <img src={artist.img} alt={artist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="font-bold text-sm mb-1 text-white truncate">{artist.title}</h4>
                        <p className="text-[10px] text-gray-300">{artist.date} {artist.month}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full text-center py-10 text-gray-500">More events coming soon...</div>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3 shrink-0"></div>
              <h2 className="text-black text-xl md:text-2xl font-black uppercase tracking-wider leading-tight">Event Gallery</h2>
            </div>
            <Link to="/gallery" className="text-primary font-semibold text-sm hover:underline whitespace-nowrap shrink-0">View All Albums</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((folder, idx) => (
              <Link to={`/gallery?event=${folder.id}`} key={idx} className="relative group overflow-hidden rounded-xl aspect-[4/3] block shadow-sm hover:shadow-xl transition-all">
                <img src={folder.coverImage} alt={folder.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-primary/40 transition-colors duration-300 flex flex-col items-center justify-center">
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ImageIcon size={14} /> {folder.count}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 text-center">
                    <span className="text-white font-black tracking-wider uppercase text-sm drop-shadow-md line-clamp-2">{folder.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-[#8b0000] py-12 text-white">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20 text-center">
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Music /></div>
            <h3 className="text-4xl font-black mb-1">{stats[0]?.val || '500+'}</h3>
            <p className="text-xs font-bold uppercase tracking-widest">{stats[0]?.desc || 'Concerts Hosted'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Ticket /></div>
            <h3 className="text-4xl font-black mb-1">{stats[1]?.val || '2M+'}</h3>
            <p className="text-xs font-bold uppercase tracking-widest">{stats[1]?.desc || 'Tickets Sold'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Users /></div>
            <h3 className="text-4xl font-black mb-1">{stats[2]?.val || '1M+'}</h3>
            <p className="text-xs font-bold uppercase tracking-widest">{stats[2]?.desc || 'Happy Customers'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><MapPin /></div>
            <h3 className="text-4xl font-black mb-1">{stats[3]?.val || '25+'}</h3>
            <p className="text-xs font-bold uppercase tracking-widest">{stats[3]?.desc || 'Cities Covered'}</p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-black text-3xl font-black uppercase tracking-wider mb-4">Frequently Asked Questions</h2>
            <div className="w-16 h-1 bg-primary"></div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'border-primary bg-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg ${activeFaq === idx ? 'text-primary' : 'text-black'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeFaq === idx ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                    {activeFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                
                <motion.div 
                  initial={false}
                  animate={{ height: activeFaq === idx ? 'auto' : 0, opacity: activeFaq === idx ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT OUR FANS SAY */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3 shrink-0"></div>
              <h2 className="text-black text-xl md:text-2xl font-black uppercase tracking-wider leading-tight">What Our Fans Say</h2>
            </div>
            <Link to="/" className="text-primary font-semibold text-sm hover:underline whitespace-nowrap shrink-0">View All</Link>
          </div>

          <div className="relative overflow-hidden w-full py-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              className="flex w-max space-x-6"
            >
              {/* First Group */}
              <div className="flex space-x-6">
                {testimonials.map((review, idx) => (
                  <div key={idx} className="bg-[#f8f8f8] p-6 rounded-xl border border-gray-200 flex gap-4 w-[320px] shrink-0">
                    <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="text-gray-600 text-sm mb-3 italic leading-relaxed">"{review.text}"</p>
                      <h4 className="font-bold text-sm text-black">{review.name}</h4>
                      <div className="flex text-secondary mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Duplicate Group for Seamless Looping */}
              <div className="flex space-x-6">
                {testimonials.map((review, idx) => (
                  <div key={`dup-${idx}`} className="bg-[#f8f8f8] p-6 rounded-xl border border-gray-200 flex gap-4 w-[320px] shrink-0">
                    <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="text-gray-600 text-sm mb-3 italic leading-relaxed">"{review.text}"</p>
                      <h4 className="font-bold text-sm text-black">{review.name}</h4>
                      <div className="flex text-secondary mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
