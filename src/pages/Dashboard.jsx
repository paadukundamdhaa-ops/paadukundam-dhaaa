import { Ticket, User, Heart, Settings, LogOut, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const tabs = [
    { name: 'My Tickets', icon: <Ticket size={20} />, active: true },
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Wishlist', icon: <Heart size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen container mx-auto px-6 flex flex-col md:flex-row gap-10">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="glass p-6 rounded-2xl border border-white/5 bg-dark">
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xl font-bold">
              JD
            </div>
            <div>
              <h3 className="font-bold">John Doe</h3>
              <p className="text-xs text-pale">john@example.com</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab, idx) => (
              <button key={idx} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${tab.active ? 'bg-primary/20 text-secondary border border-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-8">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        
        <div className="space-y-6">
          <div className="glass-dark border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-primary"></div>
            <div className="md:w-1/3 h-48 md:h-auto">
              <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800" alt="event" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">UPCOMING</span>
                  <span className="font-mono text-sm text-pale">#LV-983204</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">The Weekend Stadium Tour</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                  <div>
                    <span className="block text-pale text-xs">Date</span>
                    <span className="font-semibold text-white">Aug 15, 2026</span>
                  </div>
                  <div>
                    <span className="block text-pale text-xs">Time</span>
                    <span className="font-semibold text-white">8:00 PM</span>
                  </div>
                  <div>
                    <span className="block text-pale text-xs">Venue</span>
                    <span className="font-semibold text-white">MetLife Stadium, NY</span>
                  </div>
                  <div>
                    <span className="block text-pale text-xs">Tickets</span>
                    <span className="font-semibold text-white">2x VIP (A1, A2)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Link to="/events/1" className="text-sm hover:underline text-pale">View Event Details</Link>
                <button className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
                  <Download size={16} className="mr-2" /> Download PDF
                </button>
              </div>
            </div>
            <div className="hidden md:block absolute left-1/3 -ml-4 top-1/2 -mt-4 w-8 h-8 bg-dark rounded-full border-r border-white/10"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
