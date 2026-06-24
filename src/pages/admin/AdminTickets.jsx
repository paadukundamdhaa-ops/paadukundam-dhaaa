import React, { useState } from 'react';
import { Search, Plus, Tag, Settings, MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminTickets() {
  const [ticketTiers, setTicketTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*, events(title)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formatted = data.map(t => ({
        id: t.id,
        event: t.events?.title || 'Unknown',
        type: t.tier_name,
        price: `₹${t.price}`,
        total: t.total_capacity,
        sold: t.tickets_sold,
        status: t.status
      }));
      setTicketTiers(formatted);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
    
    const ticketsSub = supabase.channel('public:tickets-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_tiers' }, () => {
        fetchTickets();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(ticketsSub);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Ticket Inventory</h2>
          <p className="text-sm text-gray-500">Manage ticket pricing tiers and capacities for all events.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0">
          <Plus size={16} /> Add Ticket Tier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by event or ticket type..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white">
            <option>All Events</option>
            <option>Arijit Singh Live</option>
            <option>Martin Garrix NYE</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Event</th>
                <th className="p-4 font-semibold">Ticket Type</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Inventory (Sold / Total)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {ticketTiers.map((tier, idx) => {
                const percentageSold = (tier.sold / tier.total) * 100;
                
                return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-bold text-gray-800">{tier.event}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary" />
                      <span className="font-semibold text-black">{tier.type}</span>
                    </div>
                  </td>
                  <td className="p-4 font-black text-black text-lg">{tier.price}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{tier.sold} <span className="text-gray-400 font-normal">/ {tier.total}</span></span>
                      <span className="text-[10px] text-gray-500 font-bold">{percentageSold.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-48 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percentageSold >= 100 ? 'bg-red-500' : percentageSold > 80 ? 'bg-orange-500' : 'bg-green-500'}`} 
                        style={{ width: `${percentageSold}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tier.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      tier.status === 'Sold Out' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tier.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Settings">
                        <Settings size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="More">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
