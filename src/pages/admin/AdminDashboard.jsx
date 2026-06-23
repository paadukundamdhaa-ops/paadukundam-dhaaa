import React from 'react';
import { Users, Ticket, ShoppingBag, TrendingUp, DollarSign, Calendar, Music } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Revenue', value: '$45,231', increase: '+20.1%', icon: <DollarSign size={24} className="text-primary" /> },
    { title: 'Tickets Sold', value: '2,345', increase: '+15.2%', icon: <Ticket size={24} className="text-secondary" /> },
    { title: 'Active Users', value: '1,203', increase: '+5.4%', icon: <Users size={24} className="text-green-500" /> },
    { title: 'Upcoming Events', value: '12', increase: 'Next: 2 days', icon: <Calendar size={24} className="text-blue-500" /> },
  ];

  const recentBookings = [
    { id: '#BK-1029', user: 'Riya Sharma', event: 'Arijit Singh Live', date: 'Today, 10:45 AM', amount: '$150', status: 'Completed' },
    { id: '#BK-1028', user: 'Aman Verma', event: 'The Local Train', date: 'Today, 09:12 AM', amount: '$45', status: 'Completed' },
    { id: '#BK-1027', user: 'Neha Kapoor', event: 'Martin Garrix', date: 'Yesterday, 08:30 PM', amount: '$120', status: 'Completed' },
    { id: '#BK-1026', user: 'Rahul Jain', event: 'Arijit Singh Live', date: 'Yesterday, 05:15 PM', amount: '$300', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-black">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <TrendingUp size={16} /> Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-primary/50 transition-colors">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-black mb-2">{stat.value}</h3>
              <p className="text-xs font-bold text-green-500">{stat.increase}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-black">Recent Bookings</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Booking ID</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Event</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {recentBookings.map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-black">{booking.id}</td>
                    <td className="p-4 text-gray-600">{booking.user}</td>
                    <td className="p-4 font-semibold text-gray-800">{booking.event}</td>
                    <td className="p-4 text-gray-500 text-xs">{booking.date}</td>
                    <td className="p-4 font-bold text-black">{booking.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-bold text-lg text-black">Quick Actions</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-red-50 text-left transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Music size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">Create New Event</h4>
                  <p className="text-xs text-gray-500">Draft a new concert</p>
                </div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-left transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Ticket size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">Manage Tickets</h4>
                  <p className="text-xs text-gray-500">Update inventory</p>
                </div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 text-left transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">View Sales Report</h4>
                  <p className="text-xs text-gray-500">Check recent revenue</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
