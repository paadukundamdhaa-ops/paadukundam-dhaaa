import React from 'react';
import { 
  Headphones, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Music, 
  User, 
  Tag, 
  ChevronDown, 
  ShieldCheck, 
  Ticket, 
  QrCode, 
  Navigation
} from 'lucide-react';

export default function Contact() {
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
            <span className="text-[#facc15] font-serif italic text-2xl md:text-3xl mb-3 block">Contact Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.1] mb-4">
              WE'RE HERE TO <br />
              <span className="text-[#facc15]">HELP YOU!</span>
            </h1>
            <p className="text-gray-300 max-w-lg text-sm md:text-base leading-relaxed">
              Have questions, feedback, or need assistance?<br/>
              Our team is ready to help you with everything you need.
            </p>
          </div>
          
          {/* Support Card */}
          <div className="w-full lg:w-auto bg-[#120506]/80 backdrop-blur-md border border-[#8c1c24]/30 rounded-2xl p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#8c1c24] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(140,28,36,0.4)]">
              <Headphones size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Need Immediate Assistance?</h3>
              <p className="text-gray-400 text-sm mb-3">Our support team is available 24/7<br/>to help you with your queries.</p>
              <div className="text-[#facc15] font-black text-3xl md:text-4xl tracking-tight">+91 98765 43210</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-10">
          
          {/* Left Column: GET IN TOUCH */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#8c1c24] rounded-sm"></div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">GET IN TOUCH</h2>
            </div>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed pr-4">
              We'd love to hear from you. Reach out to us through any of the following channels.
            </p>

            <div className="space-y-8">
              {/* Location */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#8c1c24] flex items-center justify-center shrink-0 shadow-lg">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">Our Location</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Live Stage Entertainment Pvt. Ltd.<br/>
                    123, Music Boulevard, Bandra West,<br/>
                    Mumbai, Maharashtra 400050, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#8c1c24] flex items-center justify-center shrink-0 shadow-lg">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">Phone</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    +91 98765 43210<br/>
                    +91 98765 43211
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#8c1c24] flex items-center justify-center shrink-0 shadow-lg">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">Email</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    support@paadukundamdhaa.com<br/>
                    bookings@paadukundamdhaa.com
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex gap-5 border-b border-white/5 pb-8 lg:border-none lg:pb-0">
                <div className="w-12 h-12 rounded-full bg-[#8c1c24] flex items-center justify-center shrink-0 shadow-lg">
                  <Clock size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-2">Working Hours</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Monday - Sunday<br/>
                    10:00 AM - 08:00 PM (IST)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: FIND US HERE */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-[#8c1c24] rounded-sm"></div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">FIND US HERE</h2>
            </div>
            
            <div className="rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg h-[240px] relative">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Map Placeholder" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <MapPin size={48} fill="#8c1c24" className="text-white drop-shadow-2xl relative z-10" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/40 rounded-[100%] blur-[2px] z-0"></div>
                </div>
              </div>
            </div>

            <button className="w-full bg-[#8c1c24] hover:bg-[#6b151b] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mb-10 shadow-lg">
              <Navigation size={18} /> Get Directions
            </button>

            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">FOLLOW US</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pb-8 lg:pb-0 border-b border-white/5 lg:border-none">
              <a href="#" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#8c1c24] hover:border-[#8c1c24] transition-all hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#8c1c24] hover:border-[#8c1c24] transition-all hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#8c1c24] hover:border-[#8c1c24] transition-all hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#8c1c24] hover:border-[#8c1c24] transition-all hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="#" className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#8c1c24] hover:border-[#8c1c24] transition-all hover:scale-110">
                <Music size={18} />
              </a>
            </div>
          </div>

          {/* Right Column: SEND US A MESSAGE */}
          <div>
            <div className="bg-[#120a0b] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-[#8c1c24] rounded-sm"></div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">SEND US A MESSAGE</h2>
              </div>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all placeholder:text-gray-600" 
                      placeholder="Full Name" 
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-500" />
                    </div>
                    <input 
                      type="email" 
                      className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all placeholder:text-gray-600" 
                      placeholder="Email Address" 
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <input 
                    type="tel" 
                    className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all placeholder:text-gray-600" 
                    placeholder="Phone Number" 
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag size={18} className="text-gray-500" />
                  </div>
                  <select 
                    className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-11 pr-10 text-gray-400 text-sm focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>Subject</option>
                    <option value="booking">Ticket Booking</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>

                <div className="relative">
                  <textarea 
                    className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all placeholder:text-gray-600 min-h-[140px] resize-none" 
                    placeholder="Your Message" 
                  ></textarea>
                </div>

                <button type="button" className="w-full bg-[#facc15] hover:bg-yellow-500 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg mt-2 hover:scale-[1.02]">
                  <Send size={18} /> Send Message
                </button>
              </form>
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
