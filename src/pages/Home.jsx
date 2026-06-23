import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, Heart, ShieldCheck, Zap, Ticket, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Music, Users, Smile, GraduationCap, Crown, Ticket as TicketIcon, Disc } from 'lucide-react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 36, seconds: 48 });
  const [activeFaq, setActiveFaq] = useState(null);

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
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredEvents = [
    { id: 1, title: 'Arijit Singh Live', date: '28', month: 'MAY', venue: 'Eden Gardens, Kolkata', price: '999', img: '/images/arijit.png' },
    { id: 2, title: 'Sunburn Arena', date: '05', month: 'JUN', venue: 'Huda Grounds, Gurugram', price: '1,499', img: '/images/sunburn.png' },
    { id: 3, title: 'Atif Aslam Live', date: '14', month: 'JUN', venue: 'JLN Stadium, Delhi', price: '1,299', img: '/images/script.png' },
    { id: 4, title: 'The Local Train', date: '21', month: 'JUN', venue: 'BKC, Mumbai', price: '799', img: '/images/script.png' },
    { id: 5, title: 'Martin Garrix', date: '30', month: 'JUN', venue: 'Bengaluru Palace, Bangalore', price: '1,999', img: '/images/garrix.png' },
  ];



  return (
    <div className="bg-white min-h-screen text-black font-sans">
      
      {/* ULTRA-PREMIUM HERO SECTION */}
      <section className="bg-[#0a0a0a] text-white relative pt-32 pb-20 min-h-[90vh] flex items-center border-b border-white/10 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0 bg-black">
          <motion.img 
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="/images/sunburn.png" 
            alt="Concert" 
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>

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
              Experience Live Music<br/>
              Like <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-yellow-200 drop-shadow-[0_0_15px_rgba(245,198,36,0.5)]">Never Before</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="text-pale mb-10 max-w-xl text-lg md:text-xl font-light"
            >
              Discover and instantly book tickets for the most exciting live concerts happening around you. Secure your spot in seconds.
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
                <img src="/images/script.png" alt="The Script" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Pop Rock</span>
                </div>
              </div>
              
              <div className="p-8 pt-4 text-left relative z-10">
                <h3 className="text-4xl font-black mb-1 tracking-tight text-white drop-shadow-md">THE SCRIPT</h3>
                <p className="text-secondary font-bold tracking-widest text-xs uppercase mb-6 drop-shadow-md">Live In Concert</p>
                
                <div className="space-y-3 text-sm text-gray-300 mb-6 font-medium border-b border-white/10 pb-6">
                  <div className="flex items-center"><Calendar size={16} className="mr-3 text-secondary shrink-0" /> 25 May 2026</div>
                  <div className="flex items-center"><Clock size={16} className="mr-3 text-secondary shrink-0" /> 07:00 PM (Gates open at 5 PM)</div>
                  <div className="flex items-center"><MapPin size={16} className="mr-3 text-secondary shrink-0" /> Dome, NSCI, Mumbai</div>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Starting From</p>
                    <p className="text-2xl font-black text-white">₹1,499</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Available</span>
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-red-800 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center shadow-[0_0_15px_rgba(192,0,0,0.5)]">
                  Book Now <ArrowRight size={18} className="ml-2" />
                </button>
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
            <span className="flex items-center"><Star size={14} className="mr-2 text-secondary" /> Early Bird Tickets for Sunburn 2026 are Live!</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-secondary" /> Arijit Singh Live - 50% Sold Out!</span>
            <span className="flex items-center"><TicketIcon size={14} className="mr-2 text-secondary" /> Use code 'PDHAA10' for 10% off your first booking</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-secondary" /> The Local Train reunion tour announced</span>
          </div>
          {/* Duplicate Group for Seamless Looping */}
          <div className="flex space-x-12 items-center px-6">
            <span className="flex items-center"><Star size={14} className="mr-2 text-secondary" /> Early Bird Tickets for Sunburn 2026 are Live!</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-secondary" /> Arijit Singh Live - 50% Sold Out!</span>
            <span className="flex items-center"><TicketIcon size={14} className="mr-2 text-secondary" /> Use code 'PDHAA10' for 10% off your first booking</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-secondary" /> The Local Train reunion tour announced</span>
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

          <div className="flex space-x-6 overflow-x-auto pb-8 hide-scrollbar">
            {featuredEvents.map((event) => (
              <div key={event.id} className="min-w-[280px] bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden relative group">
                {/* Date Badge */}
                <div className="absolute top-4 left-4 bg-primary text-white text-center w-12 h-12 flex flex-col justify-center rounded-md z-10 shadow-lg">
                  <span className="text-lg font-black leading-none">{event.date}</span>
                  <span className="text-[10px] uppercase font-bold">{event.month}</span>
                </div>
                {/* Heart */}
                <button className="absolute top-4 right-4 text-white/50 hover:text-white z-10"><Heart size={20} /></button>
                
                <div className="h-48 overflow-hidden">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate text-black">{event.title}</h3>
                  <p className="text-gray-600 text-xs mb-4 truncate">{event.venue}</p>
                  <p className="font-semibold text-sm text-black">From ₹{event.price}</p>
                </div>
              </div>
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
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3"></div>
              <h2 className="text-black text-2xl font-black uppercase tracking-wider">Upcoming Concerts</h2>
            </div>
            <Link to="/events" className="text-primary font-semibold text-sm hover:underline">View All</Link>
          </div>

          <div className="relative flex justify-between items-center overflow-x-auto hide-scrollbar pb-8">
            {/* Red Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -z-10 hidden md:block"></div>
            
            {featuredEvents.map((event, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center min-w-[260px] mx-2 relative group hover:border-primary hover:shadow-xl transition-all cursor-pointer">
                <div className="text-center pr-4 border-r border-gray-200 mr-4">
                  <span className="block text-3xl font-black text-primary leading-none">{event.date}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">{event.month}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-black text-sm mb-1 truncate">{event.title}</h4>
                  <p className="text-xs text-gray-500 mb-2 truncate">{event.venue}</p>
                  <p className="text-[10px] text-primary font-bold uppercase flex items-center group-hover:underline">Book Now <ArrowRight size={10} className="ml-1" /></p>
                </div>
                {/* Timeline Dot */}
                <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 rounded-full bg-white border-4 border-primary hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTIST SPOTLIGHT */}
      <section className="bg-white py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-primary/5 to-white"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3"></div>
              <h2 className="text-black text-2xl font-black uppercase tracking-wider">Artist Spotlight</h2>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-black transition-colors"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Featured Artist */}
            <div className="lg:w-1/2 flex flex-col md:flex-row gap-6">
              <img src="/images/arijit.png" alt="Arijit Singh" className="w-full md:w-64 h-64 object-cover rounded-xl" />
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-3xl font-black mr-3">Arijit Singh</h3>
                  <span className="bg-secondary text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  The voice that touches millions of hearts. Get ready for an unforgettable night filled with soulful music and magical moments.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs rounded-full">Pop</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs rounded-full">Bollywood</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs rounded-full">Sufi</span>
                  <span className="border border-gray-300 text-gray-700 px-3 py-1 text-xs rounded-full">Romantic</span>
                </div>
              </div>
            </div>

            {/* Other Artists */}
            <div className="lg:w-1/2 grid grid-cols-3 gap-4">
              {[
                { name: 'Atif Aslam', date: '14 Jun 2026', img: '/images/script.png' },
                { name: 'The Local Train', date: '21 Jun 2026', img: '/images/sunburn.png' },
                { name: 'Martin Garrix', date: '30 Jun 2026', img: '/images/garrix.png' },
              ].map((artist, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden h-64 group cursor-pointer border border-gray-200 shadow-md">
                  <img src={artist.img} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h4 className="font-bold text-sm mb-1">{artist.name}</h4>
                    <p className="text-[10px] text-gray-300">{artist.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3"></div>
              <h2 className="text-black text-2xl font-black uppercase tracking-wider">PaadukundamDhaa Gallery</h2>
            </div>
            <Link to="/" className="text-primary font-semibold text-sm hover:underline">View Full Gallery</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1533174000243-ea84bb301e74?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1464375117522-1314d6c469e1?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1470229722913-7c090bf356c6?auto=format&fit=crop&q=80&w=600"
            ].map((img, idx) => (
              <div key={idx} className="relative group overflow-hidden rounded-xl aspect-[4/3]">
                <img src={img} alt={`Concert moment ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Heart size={32} className="text-white fill-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-[#8b0000] py-12 text-white">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20 text-center">
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Music /></div>
            <h3 className="text-4xl font-black mb-1">500+</h3>
            <p className="text-xs font-bold uppercase tracking-widest">Concerts Hosted</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Ticket /></div>
            <h3 className="text-4xl font-black mb-1">2M+</h3>
            <p className="text-xs font-bold uppercase tracking-widest">Tickets Sold</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><Users /></div>
            <h3 className="text-4xl font-black mb-1">1M+</h3>
            <p className="text-xs font-bold uppercase tracking-widest">Happy Customers</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-secondary text-4xl mb-2"><MapPin /></div>
            <h3 className="text-4xl font-black mb-1">25+</h3>
            <p className="text-xs font-bold uppercase tracking-widest">Cities Covered</p>
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
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center">
              <div className="w-1.5 h-6 bg-primary mr-3"></div>
              <h2 className="text-black text-2xl font-black uppercase tracking-wider">What Our Fans Say</h2>
            </div>
            <Link to="/" className="text-primary font-semibold text-sm hover:underline">View All</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black shrink-0"><ChevronLeft size={20} /></button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              {[
                { name: 'Riya Sharma', text: 'Amazing experience! The booking process was smooth and the concert was beyond expectations.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
                { name: 'Aman Verma', text: 'Best platform for concert tickets. Quick confirmation and easy entry with QR!', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150' },
                { name: 'Neha Kapoor', text: 'Loved the UI and how easy it is to find events. Highly recommended!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
              ].map((review, idx) => (
                <div key={idx} className="bg-[#f8f8f8] p-6 rounded-xl border border-gray-200 flex gap-4">
                  <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-gray-600 text-xs mb-3 italic">"{review.text}"</p>
                    <h4 className="font-bold text-sm text-black">{review.name}</h4>
                    <div className="flex text-secondary mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black shrink-0"><ChevronRight size={20} /></button>
          </div>
        </div>
      </section>

    </div>
  );
}
