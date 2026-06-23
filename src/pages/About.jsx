import React from 'react';
import { 
  ShieldCheck, 
  Ticket, 
  QrCode, 
  MapPin, 
  Headphones,
  Users,
  Target,
  Trophy,
  ArrowRight,
  Star,
  Zap,
  Music
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner section */}
      <div className="relative pt-36 pb-20 px-6 border-b border-white/10 bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0 bg-black">
          <img src="/images/sunburn.png" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <span className="text-primary font-serif italic text-2xl md:text-3xl mb-3 block">About Us</span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.1] mb-6">
            REDEFINING <br />
            <span className="text-primary">LIVE ENTERTAINMENT</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mx-auto max-w-2xl">
            We are passionate about connecting people through the universal language of music. From intimate acoustic sessions to massive stadium tours, we bring the best artists to you.
          </p>
        </div>
      </div>

      {/* NEWS TICKER */}
      <div className="bg-primary text-white py-3 flex overflow-hidden border-b border-gray-200 relative">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex whitespace-nowrap font-bold tracking-wider uppercase text-sm items-center w-max"
        >
          {/* First Group */}
          <div className="flex space-x-12 items-center px-6">
            <span className="flex items-center"><Star size={14} className="mr-2 text-white" /> Early Bird Tickets for Sunburn 2026 are Live!</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-white" /> Arijit Singh Live - 50% Sold Out!</span>
            <span className="flex items-center"><Ticket size={14} className="mr-2 text-white" /> Use code 'PDHAA10' for 10% off your first booking</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-white" /> The Local Train reunion tour announced</span>
          </div>
          {/* Duplicate Group for Seamless Looping */}
          <div className="flex space-x-12 items-center px-6">
            <span className="flex items-center"><Star size={14} className="mr-2 text-white" /> Early Bird Tickets for Sunburn 2026 are Live!</span>
            <span className="flex items-center"><Zap size={14} className="mr-2 text-white" /> Arijit Singh Live - 50% Sold Out!</span>
            <span className="flex items-center"><Ticket size={14} className="mr-2 text-white" /> Use code 'PDHAA10' for 10% off your first booking</span>
            <span className="flex items-center"><Music size={14} className="mr-2 text-white" /> The Local Train reunion tour announced</span>
          </div>
        </motion.div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-6 py-20 bg-white">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800" alt="Concert Stage" className="rounded-2xl shadow-xl relative z-10" />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary rounded-2xl z-0 hidden md:block"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-primary rounded-sm"></div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Our Story</h2>
            </div>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Founded in 2020, Paadukundam Dhaa started with a simple vision: to make discovering and booking live music events easier, safer, and more exciting than ever before. 
            </p>
            <p className="text-gray-600 text-base leading-relaxed mb-8">
              What began as a small ticketing platform for local indie bands has quickly grown into the premier destination for major festivals, stadium tours, and exclusive VIP experiences across the country. Our team works tirelessly behind the scenes to ensure that your only job is to enjoy the show.
            </p>
            <button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white py-3 px-8 rounded-xl font-bold flex items-center gap-3 transition-all">
              Join Our Journey <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 py-20 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-4">Why <span className="text-primary">Choose Us?</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We don't just sell tickets; we deliver unforgettable experiences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-md">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <Users size={28} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Community First</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Built by fans, for fans. We prioritize the user experience, ensuring our platform is intuitive, reliable, and accessible to everyone.</p>
            </div>
            <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-md">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <Target size={28} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Exclusive Access</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Through our deep industry partnerships, we secure early bird access, VIP passes, and exclusive meet-and-greets you won't find anywhere else.</p>
            </div>
            <div className="bg-white border border-gray-200 p-8 rounded-2xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-md">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <Trophy size={28} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Award Winning Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Our dedicated support team is available around the clock to resolve issues instantly, meaning you never have to stress about your booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <ShieldCheck className="text-primary shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-black font-bold text-sm mb-1">Secure Booking</h4>
                <p className="text-gray-600 text-xs">100% Safe & Secure</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <Ticket className="text-primary shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-black font-bold text-sm mb-1">Instant Confirmation</h4>
                <p className="text-gray-600 text-xs">Get Tickets Instantly</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <QrCode className="text-primary shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-black font-bold text-sm mb-1">QR Code Entry</h4>
                <p className="text-gray-600 text-xs">Easy & Contactless</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <MapPin className="text-primary shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-black font-bold text-sm mb-1">Best Venues</h4>
                <p className="text-gray-600 text-xs">Top Locations</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 col-span-2 lg:col-span-1">
              <Headphones className="text-primary shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-black font-bold text-sm mb-1">24/7 Support</h4>
                <p className="text-gray-600 text-xs">We're Here Anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
