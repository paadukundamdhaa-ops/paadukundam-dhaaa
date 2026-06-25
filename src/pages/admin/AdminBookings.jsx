import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Unique events for the filter dropdown
  const [uniqueEvents, setUniqueEvents] = useState([]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(title, event_date), profiles(name)')
      .order('created_at', { ascending: false });
    
    if (data) {
      setBookings(data);
      // Extract unique event titles for the dropdown
      const events = [...new Set(data.map(b => b.events?.title).filter(Boolean))];
      setUniqueEvents(events);
    }
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

  // Filter and Sort Logic
  const getFilteredAndSortedBookings = () => {
    let filtered = [...bookings];

    // Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.booking_ref?.toLowerCase().includes(term) ||
        b.profiles?.name?.toLowerCase().includes(term) ||
        b.events?.title?.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Event Filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(b => b.events?.title === eventFilter);
    }

    // Date Range Filter
    if (startDate) {
      filtered = filtered.filter(b => new Date(b.created_at) >= new Date(startDate));
    }
    if (endDate) {
      // Add one day to end date to include the entire day
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter(b => new Date(b.created_at) < end);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'amount-desc') return b.total_amount - a.total_amount;
      if (sortBy === 'amount-asc') return a.total_amount - b.total_amount;
      return 0;
    });

    return filtered;
  };

  const processedBookings = getFilteredAndSortedBookings();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(20);
    doc.text('Bookings Report', 14, 22);
    
    // Add Date Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    let filterText = [];
    if (startDate && endDate) filterText.push(`Date: ${startDate} to ${endDate}`);
    else if (startDate) filterText.push(`Date: From ${startDate}`);
    else if (endDate) filterText.push(`Date: Until ${endDate}`);
    
    if (eventFilter !== 'all') filterText.push(`Event: ${eventFilter}`);
    if (statusFilter !== 'all') filterText.push(`Status: ${statusFilter.toUpperCase()}`);
    
    if (filterText.length > 0) {
      doc.text(`Filters applied: ${filterText.join(' | ')}`, 14, 36);
    }

    // Prepare Table Data
    const tableColumn = ["Booking ID", "Date", "Customer", "Event", "Qty", "Amount", "Status"];
    const tableRows = [];

    processedBookings.forEach(booking => {
      const bookingData = [
        booking.booking_ref || 'N/A',
        new Date(booking.created_at).toLocaleDateString(),
        booking.profiles?.name || 'Unknown',
        booking.events?.title || 'Unknown',
        booking.qty?.toString() || '0',
        `Rs. ${booking.total_amount}`,
        booking.status
      ];
      tableRows.push(bookingData);
    });

    // Add Table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: filterText.length > 0 ? 42 : 36,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [225, 29, 72] } // Primary color #e11d48
    });

    // Save PDF
    doc.save(`bookings-report-${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-black">Bookings & Orders</h2>
          <p className="text-sm text-gray-500">Track all ticket sales, manage refunds, and view transaction statuses.</p>
        </div>
        <button onClick={handleExportPDF} className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0">
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col xl:flex-row justify-between gap-4 bg-gray-50">
          
          <div className="relative w-full xl:w-96 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, User, or Event..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Event Filter */}
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white min-w-[140px] flex-grow sm:flex-grow-0"
            >
              <option value="all">All Events</option>
              {uniqueEvents.map(evt => (
                <option key={evt} value={evt}>{evt}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white flex-grow sm:flex-grow-0"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white w-full sm:w-auto"
                title="Start Date"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white w-full sm:w-auto"
                title="End Date"
              />
            </div>

            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white flex-grow sm:flex-grow-0"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
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
              ) : processedBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No bookings match the selected filters.</td>
                </tr>
              ) : (
                processedBookings.map((booking) => {
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
