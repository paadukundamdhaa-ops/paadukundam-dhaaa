import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(title, event_date), profiles(name)')
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    const bookingsSubscription = supabase.channel('public:bookings-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Bookings & Orders</h2>
          <p className="text-sm text-gray-500">Track all ticket sales, manage refunds, and view transaction statuses.</p>
        </div>
        <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm shrink-0">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header / Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Booking ID, User, or Event..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Booking ID / Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Event Details</th>
                <th className="p-4 font-semibold">Ticket Type</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold">Status & Check-in</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No bookings found.</td>
                </tr>
              ) : (
                bookings
                  .filter(b => 
                    b.booking_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.events?.title?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((booking) => {
                  const eventDate = booking.events?.event_date ? new Date(booking.events.event_date).toLocaleDateString() : '';
                  const purchaseDate = new Date(booking.created_at).toLocaleString();
                  const isCheckedIn = booking.check_in_status === 'checked_in';
                  const isDenied = booking.check_in_status === 'denied';

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <p className="font-bold text-black">{booking.booking_ref}</p>
                        <p className="text-xs text-gray-500 mt-1">{purchaseDate}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{booking.profiles?.name || 'Unknown'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">{booking.events?.title || 'Unknown Event'}</p>
                        <p className="text-xs text-gray-500 mt-1">{eventDate}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">General</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {booking.qty}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-black text-black">₹{booking.total_amount}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'completed' || booking.status === 'success' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </div>
                          
                          {/* Check-in Status Badge */}
                          {(isCheckedIn || isDenied) && (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCheckedIn ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                            }`}>
                              <ShieldCheck size={12} />
                              {isCheckedIn ? 'Checked In' : 'Entry Denied'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Options">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
