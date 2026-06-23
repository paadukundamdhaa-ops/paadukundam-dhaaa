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
  ArrowRight
} from 'lucide-react';

export default function About() {
  return (
    <div className="pt-20 min-h-screen bg-[#0a0a0a]">
      {/* Top Banner section */}
      <div className="relative pt-16 pb-20 px-6 border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img src="/images/sunburn.png" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <span className="text-[#facc15] font-serif italic text-2xl md:text-3xl mb-3 block">About Us</span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.1] mb-6">
            REDEFINING <br />
            <span className="text-[#facc15]">LIVE ENTERTAINMENT</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mx-auto max-w-2xl">
            We are passionate about connecting people through the universal language of music. From intimate acoustic sessions to massive stadium tours, we bring the best artists to you.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800" alt="Concert Stage" className="rounded-2xl shadow-[0_0_40px_rgba(140,28,36,0.2)] relative z-10" />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[#8c1c24] rounded-2xl z-0 hidden md:block"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#8c1c24] rounded-sm"></div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Our Story</h2>
            </div>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
              Founded in 2020, Paadukundam Dhaa started with a simple vision: to make discovering and booking live music events easier, safer, and more exciting than ever before. 
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              What began as a small ticketing platform for local indie bands has quickly grown into the premier destination for major festivals, stadium tours, and exclusive VIP experiences across the country. Our team works tirelessly behind the scenes to ensure that your only job is to enjoy the show.
            </p>
            <button className="bg-transparent border-2 border-[#facc15] text-[#facc15] hover:bg-[#facc15] hover:text-black py-3 px-8 rounded-xl font-bold flex items-center gap-3 transition-all">
              Join Our Journey <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-[#120a0b] py-20 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">Why <span className="text-[#8c1c24]">Choose Us?</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We don't just sell tickets; we deliver unforgettable experiences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl hover:border-[#8c1c24]/50 transition-colors group shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#8c1c24]/20 flex items-center justify-center mb-6 group-hover:bg-[#8c1c24] transition-colors">
                <Users size={28} className="text-[#facc15] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Built by fans, for fans. We prioritize the user experience, ensuring our platform is intuitive, reliable, and accessible to everyone.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl hover:border-[#8c1c24]/50 transition-colors group shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#8c1c24]/20 flex items-center justify-center mb-6 group-hover:bg-[#8c1c24] transition-colors">
                <Target size={28} className="text-[#facc15] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Exclusive Access</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Through our deep industry partnerships, we secure early bird access, VIP passes, and exclusive meet-and-greets you won't find anywhere else.</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl hover:border-[#8c1c24]/50 transition-colors group shadow-lg">
              <div className="w-14 h-14 rounded-full bg-[#8c1c24]/20 flex items-center justify-center mb-6 group-hover:bg-[#8c1c24] transition-colors">
                <Trophy size={28} className="text-[#facc15] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Award Winning Support</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our dedicated support team is available around the clock to resolve issues instantly, meaning you never have to stress about your booking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-white/5 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <ShieldCheck className="text-[#facc15] shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Secure Booking</h4>
                <p className="text-gray-500 text-xs">100% Safe & Secure</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <Ticket className="text-[#facc15] shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Instant Confirmation</h4>
                <p className="text-gray-500 text-xs">Get Tickets Instantly</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <QrCode className="text-[#facc15] shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">QR Code Entry</h4>
                <p className="text-gray-500 text-xs">Easy & Contactless</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <MapPin className="text-[#facc15] shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Best Venues</h4>
                <p className="text-gray-500 text-xs">Top Locations</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 col-span-2 lg:col-span-1">
              <Headphones className="text-[#facc15] shrink-0" size={32} strokeWidth={1.5} />
              <div>
                <h4 className="text-white font-bold text-sm mb-1">24/7 Support</h4>
                <p className="text-gray-500 text-xs">We're Here Anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
