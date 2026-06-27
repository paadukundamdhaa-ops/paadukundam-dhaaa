import React, { useState, useEffect } from 'react';
import { Ticket, CreditCard, Banknote, CheckCircle, QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function BoxOffice() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [autoCheckin, setAutoCheckin] = useState(true);
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('status', ['Live', 'Upcoming'])
        .order('event_date', { ascending: true });
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const ev = events.find(e => e.id === selectedEventId);
      setSelectedEvent(ev);
      
      const fetchTiers = async () => {
        const { data } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('event_id', selectedEventId)
          .eq('status', 'Active');
        if (data) {
          setTiers(data);
          if (data.length > 0) setSelectedTierId(data[0].id);
        }
      };
      fetchTiers();
    } else {
      setSelectedEvent(null);
      setTiers([]);
      setSelectedTierId('');
    }
  }, [selectedEventId, events]);

  const selectedTier = tiers.find(t => t.id === selectedTierId);
  const totalAmount = selectedTier ? selectedTier.price * qty : 0;
  
  // Calculate remaining availability
  const availableTickets = selectedTier ? (selectedTier.total_capacity - (selectedTier.tickets_sold || 0) - (selectedTier.reserved_capacity || 0)) : 0;

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !selectedTierId || qty < 1) return;

    if (qty > availableTickets) {
      Swal.fire('Error', 'Not enough tickets available in this tier.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/issue-ticket', {
        event_id: selectedEventId,
        tier_id: selectedTierId,
        qty: qty,
        amount_paid: totalAmount,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        auto_checkin: autoCheckin
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Ticket Issued!',
          text: `Booking successfully created.`,
          confirmButtonColor: '#10b981'
        });
        
        // Reset form
        setQty(1);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        
        // Refresh tier data to update capacity
        const { data } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('event_id', selectedEventId)
          .eq('status', 'Active');
        if (data) setTiers(data);
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Failed to issue ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <Ticket className="text-primary" /> Box Office
        </h2>
        <p className="text-sm text-gray-500">Sell tickets on-the-spot with cash or POS. Bypasses online payment gateway.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Selections */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Event</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Choose Event --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ticket Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {tiers.map(tier => {
                      const avail = tier.total_capacity - (tier.tickets_sold || 0) - (tier.reserved_capacity || 0);
                      const isSoldOut = avail <= 0;
                      return (
                        <div 
                          key={tier.id}
                          onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                          className={`border rounded-xl p-3 cursor-pointer transition-all ${
                            selectedTierId === tier.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 
                            isSoldOut ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="font-bold text-black text-sm mb-1">{tier.tier_name}</div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-gray-700">₹{tier.price}</span>
                            <span className={isSoldOut ? 'text-red-500 font-bold' : 'text-green-600 font-medium'}>
                              {isSoldOut ? 'Sold Out' : `${avail} left`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedTier && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200"
                    >-</button>
                    <div className="w-16 h-10 flex items-center justify-center font-black text-xl border border-gray-200 rounded-lg">
                      {qty}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setQty(Math.min(availableTickets, qty + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200"
                    >+</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Details & Checkout */}
            <div className="space-y-5 bg-white p-5 rounded-xl border border-gray-100 shadow-inner">
              <h3 className="font-bold border-b border-gray-100 pb-2 mb-3">Customer Details <span className="text-gray-400 font-normal text-xs">(Optional)</span></h3>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <h3 className="font-bold border-b border-gray-100 pb-2 mb-3 mt-6">Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'cash' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Banknote size={18} className="mb-1" /> Cash
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'upi' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode size={18} className="mb-1" /> UPI Scanner
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('pos')}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'pos' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={18} className="mb-1" /> Card POS
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoCheckin}
                    onChange={(e) => setAutoCheckin(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" 
                  />
                  <span className="text-sm font-bold text-gray-700">Auto Check-in <span className="text-xs font-normal text-gray-500">(Admit instantly)</span></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-white flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total to collect</p>
            <p className="text-3xl font-black text-black">₹{totalAmount}</p>
          </div>
          
          <button 
            onClick={handleIssueTicket}
            disabled={loading || !selectedTier || qty < 1 || qty > availableTickets}
            className="bg-primary text-white font-black px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2 text-lg"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <CheckCircle />}
            Issue {qty} Ticket{qty > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
