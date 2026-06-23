import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Music, 
  Mic2, 
  Camera, 
  Users, 
  ChevronDown, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  Star, 
  Send,
  ShieldCheck,
  Ticket,
  QrCode,
  MapPin,
  Headphones
} from 'lucide-react';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = [
    { id: 'All', icon: <LayoutGrid size={16} /> },
    { id: 'Concerts', icon: <Music size={16} /> },
    { id: 'Artists', icon: <Mic2 size={16} /> },
    { id: 'Behind The Scenes', icon: <Camera size={16} /> },
    { id: 'Crowd Moments', icon: <Users size={16} /> },
  ];
  
  // Custom layout sizes for the grid matching the screenshot
  const gridLayout = [
    'col-span-12 md:col-span-6 lg:col-span-3', // 1 (wide)
    'col-span-12 md:col-span-3 lg:col-span-2', // 2 (square)
    'col-span-12 md:col-span-6 lg:col-span-3', // 3 (wide)
    'col-span-12 md:col-span-3 lg:col-span-2', // 4 (square)
    'col-span-12 md:col-span-4 lg:col-span-2', // 5 (square)
    
    'col-span-12 md:col-span-6 lg:col-span-3', // 6 (wide)
    'col-span-12 md:col-span-3 lg:col-span-2', // 7 (square)
    'col-span-12 md:col-span-3 lg:col-span-2', // 8 (square)
    'col-span-12 md:col-span-6 lg:col-span-3', // 9 (wide)
    'col-span-12 md:col-span-6 lg:col-span-2', // 10 (square)
  ];

  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1540039155732-6761b3336765?auto=format&fit=crop&q=80&w=800' },
    { id: 2, url: 'https://images.unsplash.com/photo-1493225457124-a1a2f295fa07?auto=format&fit=crop&q=80&w=800' },
    { id: 3, url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800' },
    { id: 4, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800' },
    { id: 5, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800' },
    { id: 6, url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' },
    { id: 7, url: 'https://images.unsplash.com/photo-1533174000223-11440fb4ce8f?auto=format&fit=crop&q=80&w=800' },
    { id: 8, url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800' },
    { id: 9, url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800' },
    { id: 10, url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#0a0a0a]">
      
      {/* Top Banner section */}
      <div className="relative pt-16 pb-16 px-6 border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img src="/images/sunburn.png" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Hero Text */}
          <div className="lg:w-1/2">
            <span className="text-[#facc15] font-serif italic text-2xl md:text-3xl mb-3 block">Gallery</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.1] mb-4">
              MOMENTS THAT <br />
              <span className="text-[#facc15]">STAY FOREVER</span>
            </h1>
            <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed">
              Relive the electrifying moments, unforgettable performances, and the energy of live music.
            </p>
          </div>
          
          {/* Stats Grid - Redesigned for Premium Look */}
          <div className="w-full lg:w-3/5 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 lg:mt-0">
            {[
              { icon: <ImageIcon size={24} />, num: '2,450+', label: 'Photos' },
              { icon: <Video size={24} />, num: '350+', label: 'Videos' },
              { icon: <Users size={24} />, num: '120+', label: 'Events' },
              { icon: <Star size={24} />, num: '50+', label: 'Artists' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#facc15]/50 hover:bg-[#1a0b0c]/80 transition-all duration-300 rounded-2xl p-5 md:p-6 text-center group shadow-xl relative overflow-hidden cursor-pointer hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-b from-[#facc15]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#facc15]/20 transition-all duration-300">
                  <div className="text-[#facc15] group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all">{stat.icon}</div>
                </div>
                <h3 className="text-white font-black text-2xl md:text-3xl mb-1 relative z-10 group-hover:text-[#facc15] transition-colors">{stat.num}</h3>
                <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider relative z-10 group-hover:text-white transition-colors">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="container mx-auto px-6 mt-8 mb-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          
          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#8c1c24] text-white shadow-lg' 
                    : 'bg-transparent border border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex-1 xl:flex-none flex items-center justify-between gap-6 bg-transparent border border-white/10 text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors">
              Latest First <ChevronDown size={16} />
            </div>
            <button className="flex items-center gap-2 bg-[#8c1c24] hover:bg-[#6b151b] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>

        </div>
      </div>

      {/* Masonry-style Grid */}
      <div className="container mx-auto px-6 mb-16">
        <div className="grid grid-cols-12 gap-4">
          {images.map((img, idx) => (
            <div 
              key={img.id} 
              className={`group relative rounded-xl overflow-hidden bg-[#120a0b] cursor-pointer shadow-lg ${gridLayout[idx]}`}
            >
              <img 
                src={img.url} 
                alt="Concert" 
                className="w-full h-[220px] md:h-[260px] object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-6 mb-16">
        <div className="bg-gradient-to-r from-[#1f0b0d] to-[#120506] border border-[#8c1c24]/20 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1540039155732-6761b3336765?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-screen mask-image-linear" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1f0b0d] to-transparent"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10 w-full lg:w-3/5">
            <div className="w-16 h-16 rounded-2xl bg-[#2a1215] border border-[#facc15]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
              <ImageIcon size={28} className="text-[#facc15]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Never Miss a Moment!</h3>
              <p className="text-gray-400 text-sm md:text-base">Subscribe to get the best concert photos, videos and event highlights delivered to your inbox.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto relative z-10">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white text-gray-900 px-5 py-3.5 rounded-xl w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#facc15] font-medium text-sm" 
            />
            <button className="w-full sm:w-auto bg-[#facc15] hover:bg-yellow-500 text-black px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-lg">
              Subscribe Now <Send size={16} />
            </button>
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
