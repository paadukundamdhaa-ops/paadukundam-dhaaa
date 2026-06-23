import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminBookings() {
  const [bookings] = useState([
    { id: '#BK-1029', user: 'Riya Sharma', event: 'Arijit Singh Live', date: 'Oct 24, 2026', type: 'VIP', qty: 2, amount: '$150', status: 'Completed', purchaseDate: 'Today, 10:45 AM' },
    { id: '#BK-1028', user: 'Aman Verma', event: 'The Local Train', date: 'Nov 12, 2026', type: 'General', qty: 1, amount: '$45', status: 'Completed', purchaseDate: 'Today, 09:12 AM' },
    { id: '#BK-1027', user: 'Neha Kapoor', event: 'Martin Garrix NYE', date: 'Dec 31, 2026', type: 'Early Bird', qty: 4, amount: '$120', status: 'Completed', purchaseDate: 'Yesterday, 08:30 PM' },
    { id: '#BK-1026', user: 'Rahul Jain', event: 'Arijit Singh Live', date: 'Oct 24, 2026', type: 'VVIP', qty: 2, amount: '$300', status: 'Pending', purchaseDate: 'Yesterday, 05:15 PM' },
    { id: '#BK-1025', user: 'Priya Desai', event: 'Atif Aslam Unplugged', date: 'Jan 15, 2027', type: 'General', qty: 3, amount: '$90', status: 'Failed', purchaseDate: '20 Jun, 11:20 AM' },
  ]);

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
              placeholder="Search by Booking ID, User, or Event..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <select className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-600 bg-white">
              <option>All Events</option>
              <option>Arijit Singh Live</option>
              <option>Martin Garrix NYE</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
              <Filter size={16} /> Filter
            </button>
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
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {bookings.map((booking, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-black">{booking.id}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.purchaseDate}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{booking.user}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{booking.event}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{booking.type}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {booking.qty}</p>
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-black text-black">{booking.amount}</p>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'Completed' && <CheckCircle size={12} />}
                      {booking.status === 'Pending' && <Clock size={12} />}
                      {booking.status === 'Failed' && <XCircle size={12} />}
                      {booking.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Options">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 text-sm">
          <p className="text-gray-500">Showing <span className="font-bold text-black">1</span> to <span className="font-bold text-black">5</span> of <span className="font-bold text-black">842</span> bookings</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-primary text-white rounded font-bold">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
