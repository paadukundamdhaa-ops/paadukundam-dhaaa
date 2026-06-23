import { Link, useParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Share2, Heart, CheckCircle2, Info, ArrowLeft, Ticket, Star, Sparkles, Music, ShieldAlert, Camera, Ban } from 'lucide-react';
import { allEvents } from '../data/mockData';
import { useState, useEffect } from 'react';

export default function EventDetails() {
  const { id } = useParams();
  const event = allEvents.find(e => e.id === parseInt(id)) || allEvents[0];
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [selectedTier, setSelectedTier] = useState('VIP');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ticketTiers = [
    { name: 'VIP', price: event.price * 2, status: 'Fast Filling' },
    { name: 'Gold', price: Math.round(event.price * 1.5), status: 'Available' },
    { name: 'General', price: event.price, status: 'Available' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-16">
      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[60vh] bg-black">
        <img src={event.img} alt={event.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
          <Link to="/events" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors font-semibold">
            <ArrowLeft size={20} className="mr-2" /> Back to Events
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-black tracking-wider uppercase mb-4 inline-block shadow-lg">{event.category}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">{event.title}</h1>
              <p className="text-lg md:text-xl text-gray-200 flex items-center font-medium">
                <MapPin className="mr-2 text-secondary" size={24} /> {event.venue}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors border border-white/10 shadow-lg"><Share2 size={20} /></button>
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors border border-white/10 shadow-lg"><Heart size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left Col (Info) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* About Section */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-4 text-black flex items-center">
              <Info className="mr-3 text-primary" /> About The Event
            </h2>
            <p className="text-gray-600 leading-relaxed font-medium text-lg">
              Experience the ultimate live event of the year! Join us for a breathtaking performance by <span className="font-bold text-black">{event.artist}</span>. 
              Expect stunning visuals, incredible acoustics, and a night filled with unforgettable moments. 
              Gather your friends and make memories that will last a lifetime. Book your tickets now before they sell out!
            </p>
          </section>

          {/* Event Highlights */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 text-black flex items-center">
              <Star className="mr-3 text-secondary fill-secondary" /> Why You Should Attend
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <Music className="text-primary" size={24} />
                </div>
                <h4 className="font-bold text-black mb-1">Live Music</h4>
                <p className="text-sm text-gray-500 font-medium">3 hours of uninterrupted premium live performance.</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <Sparkles className="text-primary" size={24} />
                </div>
                <h4 className="font-bold text-black mb-1">Stunning Visuals</h4>
                <p className="text-sm text-gray-500 font-medium">State-of-the-art stage setup and light shows.</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <Heart className="text-primary" size={24} />
                </div>
                <h4 className="font-bold text-black mb-1">Fan Experience</h4>
                <p className="text-sm text-gray-500 font-medium">Exclusive merchandise and interactive fan zones.</p>
              </div>
            </div>
          </section>

          {/* Details Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-secondary/50 transition-colors cursor-default">
              <div className="bg-primary/10 p-4 rounded-full mr-5">
                <Calendar className="text-primary" size={28} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="font-black text-lg text-black">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-secondary/50 transition-colors cursor-default">
              <div className="bg-primary/10 p-4 rounded-full mr-5">
                <Clock className="text-primary" size={28} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Time</p>
                <p className="font-black text-lg text-black">{event.time}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Gates open 2 hrs prior</p>
              </div>
            </div>
          </section>

          {/* Location Map Placeholder */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 text-black flex items-center">
              <MapPin className="mr-3 text-primary" /> Venue Location
            </h2>
            <div className="h-64 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
               {/* Decorative map-like background pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
              <MapPin className="text-gray-400 mb-3 relative z-10" size={40} />
              <p className="font-bold text-gray-500 text-lg relative z-10">{event.venue}</p>
              <p className="text-gray-400 text-sm mt-1 relative z-10">Interactive Map Integration Pending</p>
            </div>
          </section>

          {/* Terms and Conditions */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-4 text-black flex items-center">
              <Info className="mr-3 text-primary" /> Terms & Conditions
            </h2>
            <ul className="space-y-3 text-gray-600 font-medium list-inside list-disc">
              <li>Please carry a valid ID proof along with the valid ticket.</li>
              <li>No refunds on purchased ticket are possible, even in case of any rescheduling.</li>
              <li>Security procedures, including frisking remain the right of the management.</li>
              <li>No dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, lazer devices, bottles, musical instruments will be allowed in the venue.</li>
              <li>People in an inebriated state may not be allowed entry.</li>
            </ul>
          </section>

          {/* Event Policies */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 text-black flex items-center">
              <ShieldAlert className="mr-3 text-primary" /> Event Policies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3 shrink-0"><CheckCircle2 className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Age Limit</h4>
                  <p className="text-sm text-gray-500">18+ strictly. Valid ID required.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3 shrink-0"><Ban className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Outside Food</h4>
                  <p className="text-sm text-gray-500">Not permitted inside the venue.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3 shrink-0"><Camera className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Photography</h4>
                  <p className="text-sm text-gray-500">Professional cameras are banned.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3 shrink-0"><Ban className="text-primary" size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Re-entry</h4>
                  <p className="text-sm text-gray-500">No re-entry allowed once exited.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Related Images / Gallery */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 text-black flex items-center">
              <Camera className="mr-3 text-primary" /> Event Gallery
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-40 rounded-xl overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1540039155732-61ee14b12658?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery 1" />
              </div>
              <div className="h-40 rounded-xl overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1470229722913-7c090be5f524?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery 2" />
              </div>
              <div className="h-40 rounded-xl overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery 3" />
              </div>
              <div className="h-40 rounded-xl overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery 4" />
              </div>
            </div>
          </section>
        </div>

        {/* Right Col (Sticky Ticket Widget) */}
        <div className="relative">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 sticky top-28">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-black flex items-center">
                  <Ticket className="mr-2 text-secondary" size={24}/> Book Tickets
                </h3>
                <p className="text-gray-500 font-medium mt-1 text-sm">Select your preferred category</p>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="space-y-4 mb-8">
              {ticketTiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedTier(tier.name)}
                  className={`flex justify-between items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === tier.name ? 'border-secondary bg-secondary/5 shadow-md' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}
                >
                  <div>
                    <h4 className="font-black text-black">{tier.name}</h4>
                    <p className={`text-xs font-bold mt-0.5 ${tier.status === 'Fast Filling' ? 'text-primary' : 'text-green-600'}`}>{tier.status}</p>
                  </div>
                  <div className="text-right flex items-center">
                    <span className="font-black text-lg text-black">₹{tier.price.toLocaleString('en-IN')}</span>
                    <div className={`ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTier === tier.name ? 'border-secondary bg-secondary' : 'border-gray-300'}`}>
                      {selectedTier === tier.name && <div className="w-2 h-2 bg-black rounded-full"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-bold text-gray-700">Quantity</span>
              <div className="flex items-center space-x-4 bg-white rounded-xl px-2 py-1 shadow-sm border border-gray-200">
                <button 
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-black text-gray-600 transition-colors"
                >-</button>
                <span className="font-black text-lg w-4 text-center text-black">{ticketQuantity}</span>
                <button 
                  onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-black text-gray-600 transition-colors"
                >+</button>
              </div>
            </div>

            {/* Total & Checkout */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Total Amount</span>
                <span className="text-3xl font-black text-black">₹{(ticketTiers.find(t => t.name === selectedTier)?.price * ticketQuantity).toLocaleString('en-IN')}</span>
              </div>
              <Link to="/checkout" className="block w-full py-4 text-center bg-secondary hover:bg-[#e0b51f] text-black font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Proceed to Checkout
              </Link>
            </div>

            <ul className="mt-6 space-y-3 text-sm font-medium text-gray-500">
              <li className="flex items-center"><CheckCircle2 size={16} className="mr-3 text-green-500 shrink-0" /> Instant E-Ticket Delivery via Email</li>
              <li className="flex items-center"><CheckCircle2 size={16} className="mr-3 text-green-500 shrink-0" /> 100% Secure Encrypted Payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
