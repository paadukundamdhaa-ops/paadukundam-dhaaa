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
    <div className="min-h-screen bg-white">
      
      {/* Top Banner section */}
      <div className="relative pt-36 pb-16 px-6 border-b border-white/10 bg-[#0a0a0a]">
        <div className="absolute inset-0 z-0 bg-black">
          <img src="/images/sunburn.png" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="lg:w-1/2">
            <span className="text-primary font-serif italic text-2xl md:text-3xl mb-3 block">Gallery</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.1] mb-4">
              MOMENTS THAT <br />
              <span className="text-primary">STAY FOREVER</span>
            </h1>
            <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed">
              Relive the electrifying moments, unforgettable performances, and the energy of live music.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Moved to Main Content Area */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <ImageIcon size={28} />, num: '2,450+', label: 'Photos' },
            { icon: <Video size={28} />, num: '350+', label: 'Videos' },
            { icon: <Users size={28} />, num: '120+', label: 'Events' },
            { icon: <Star size={28} />, num: '50+', label: 'Artists' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 md:p-8 text-center group shadow-sm hover:shadow-xl relative overflow-hidden cursor-pointer hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <div className="text-primary group-hover:text-white transition-colors">{stat.icon}</div>
              </div>
              <h3 className="text-black font-black text-3xl md:text-4xl mb-2 relative z-10 group-hover:text-primary transition-colors">{stat.num}</h3>
              <span className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest relative z-10 transition-colors">{stat.label}</span>
            </div>
          ))}
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
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex-1 xl:flex-none flex items-center justify-between gap-6 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
              Latest First <ChevronDown size={16} />
            </div>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors">
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
              className={`group relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-md ${gridLayout[idx]}`}
            >
              <img 
                src={img.url} 
                alt="Concert" 
                className="w-full h-[220px] md:h-[260px] object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-6 mb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
          
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none hidden md:block">
            <img src="https://images.unsplash.com/photo-1540039155732-6761b3336765?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover mix-blend-multiply mask-image-linear" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-transparent"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10 w-full lg:w-3/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ImageIcon size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black mb-2">Never Miss a Moment!</h3>
              <p className="text-gray-600 text-sm md:text-base">Subscribe to get the best concert photos, videos and event highlights delivered to your inbox.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto relative z-10">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white border border-gray-300 text-gray-900 px-5 py-3.5 rounded-xl w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm shadow-sm" 
            />
            <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-md">
              Subscribe Now <Send size={16} />
            </button>
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
