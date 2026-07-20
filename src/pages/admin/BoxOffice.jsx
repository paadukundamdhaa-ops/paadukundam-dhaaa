import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Clock, Ticket, CheckCircle, RefreshCw, Banknote, QrCode, CreditCard, Printer } from 'lucide-react';
import { supabaseAdmin as supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BoxOffice() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [tiers, setTiers] = useState([]);
  const [selectedTierId, setSelectedTierId] = useState('');
  
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, razorpay, pos
  const [autoCheckin, setAutoCheckin] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  
  // State for JPG ticket generation
  const [generatedTicketImg, setGeneratedTicketImg] = useState(null);
  const ticketRef = useRef(null);
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .neq('status', 'Draft')
        .neq('status', 'Completed')
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
  const subtotal = selectedTier ? selectedTier.price * qty : 0;
  const platformFee = selectedTier ? 10 * qty : 0;
  const totalAmount = subtotal + platformFee;
  
  // Calculate remaining availability
  const availableTickets = selectedTier ? (selectedTier.total_capacity - (selectedTier.tickets_sold || 0) - (selectedTier.reserved_capacity || 0)) : 0;

  const handleIssueTicket = async (e) => {
    e.preventDefault();
    if (!selectedTierId || qty < 1 || !selectedEventId) return;

    if (paymentMethod === 'razorpay') {
      try {
        setLoading(true);
        const res = await loadRazorpayScript();
        if (!res) throw new Error('Razorpay SDK failed to load. Please check your internet connection.');

        // Initialize Razorpay payment
        const initResponse = await fetch('/api/admin/init-boxoffice-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount }),
        });

        if (!initResponse.ok) {
          const errData = await initResponse.json();
          throw new Error(errData.error || 'Failed to initialize payment');
        }

        const initData = await initResponse.json();

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: initData.amount,
          currency: initData.currency,
          name: "PaadukundamDhaa Box Office",
          description: `Tickets for ${selectedEvent.title}`,
          order_id: initData.orderId,
          handler: async function (response) {
            await completeTicketIssuance(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: {
            name: customerName || 'Walk-in Guest',
            email: customerEmail || '',
            contact: customerPhone || ''
          },
          theme: { color: "#cc0000" }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          Swal.fire('Payment Failed', response.error.description, 'error');
          setLoading(false);
        });
        rzp.open();
      } catch (error) {
        Swal.fire('Error', error.message || 'Payment initialization failed', 'error');
        setLoading(false);
      }
    } else {
      // Offline payment
      await completeTicketIssuance();
    }
  };

  const completeTicketIssuance = async (razorpay_payment_id = null, razorpay_order_id = null, razorpay_signature = null) => {
    try {
      setLoading(true);
      const payload = {
        event_id: selectedEventId,
        tier_id: selectedTierId,
        qty: qty,
        amount_paid: totalAmount,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        auto_checkin: autoCheckin
      };

      if (razorpay_payment_id) {
        payload.razorpay_payment_id = razorpay_payment_id;
        payload.razorpay_order_id = razorpay_order_id;
        payload.razorpay_signature = razorpay_signature;
      }

      const response = await fetch('/api/admin/issue-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to issue ticket');
      }

      const result = await response.json();

      if (result.success) {
        if (sendEmail && customerEmail && result.bookingRef) {
          try {
            await fetch('/api/send-ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: customerEmail,
                name: customerName || 'Guest',
                eventTitle: selectedEvent.title,
                eventDate: selectedEvent.event_date,
                eventVenue: selectedEvent.venue,
                eventCity: '',
                bookingRef: result.bookingRef,
                qty: qty,
                amount: totalAmount,
                subtotal: subtotal,
                discount: 0,
                platformFee: platformFee,
                termsAndConditions: selectedEvent.terms_and_conditions
              })
            });
          } catch (e) {
            console.error('Failed to send email:', e);
          }
        }

        // Save last booking info
        const bookingInfo = {
          bookingRef: result.bookingRef,
          customerName: customerName || 'Walk-in Guest',
          eventName: selectedEvent.title,
          tierName: selectedTier.tier_name,
          qty,
          totalAmount,
          paymentMethod,
          date: new Date().toLocaleString()
        };
        setLastBooking(bookingInfo);

        // Generate JPG Ticket
        setTimeout(async () => {
          if (ticketRef.current) {
            try {
              const canvas = await html2canvas(ticketRef.current, { scale: 2, useCORS: true, backgroundColor: null });
              const imgData = canvas.toDataURL('image/jpeg', 0.9);
              setGeneratedTicketImg(imgData);
              
              Swal.fire({
                title: 'Ticket Issued Successfully!',
                html: `
                  <div style="display:flex; flex-direction:column; align-items:center;">
                    <p style="margin-bottom:15px; color:#666;">${sendEmail && customerEmail ? 'Email sent to customer.' : ''}</p>
                    <img src="${imgData}" style="max-width:100%; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
                  </div>
                `,
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonColor: '#10b981',
                denyButtonColor: '#3b82f6',
                confirmButtonText: 'Print Thermal Receipt',
                denyButtonText: 'Download JPG Ticket',
                cancelButtonText: 'Close',
                width: '600px'
              }).then((res) => {
                if (res.isConfirmed) {
                  handlePrintReceipt();
                } else if (res.isDenied) {
                  const link = document.createElement('a');
                  link.href = imgData;
                  link.download = `Ticket_${result.bookingRef}.jpg`;
                  link.click();
                }
              });
            } catch (err) {
              console.error("html2canvas error:", err);
              // Fallback if JPG fails
              Swal.fire({
                icon: 'success',
                title: 'Ticket Issued!',
                confirmButtonColor: '#10b981',
                showCancelButton: true,
                confirmButtonText: 'Print Receipt',
                cancelButtonText: 'Close'
              }).then((res) => {
                if (res.isConfirmed) handlePrintReceipt();
              });
            }
          }
        }, 300);
        
        // Save last booking for print receipt
        setLastBooking({
          bookingRef: result.bookingRef,
          customerName: customerName || 'Walk-in Guest',
          eventName: selectedEvent.title,
          tierName: selectedTier.tier_name,
          qty,
          totalAmount,
          paymentMethod,
          date: new Date().toLocaleString()
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

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <>
    {/* PRINT ONLY STYLES FOR THERMAL PRINTER (80mm) */}
    <style dangerouslySetInnerHTML={{__html: `
      @media print {
        body * { visibility: hidden; }
        .thermal-receipt, .thermal-receipt * { visibility: visible; }
        .thermal-receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 80mm;
          padding: 5mm;
          margin: 0;
          font-family: monospace;
          color: black;
          background: white;
        }
        @page { margin: 0; size: 80mm auto; }
      }
    `}} />

    {/* HIDDEN VISUAL TICKET FOR HTML2CANVAS */}
    {lastBooking && (
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div 
          ref={ticketRef}
          style={{ width: '400px', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', padding: '24px', fontFamily: 'sans-serif' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <img src="/images/LOGO __ Option 02.png" alt="Logo" style={{ height: '50px', margin: '0 auto', objectFit: 'contain' }} crossOrigin="anonymous" />
          </div>
          <div style={{ backgroundColor: '#cc0000', color: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{lastBooking.eventName}</h2>
             <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{lastBooking.date}</p>
          </div>
          <div style={{ marginBottom: '15px', padding: '0 5px' }}>
             <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>TICKET HOLDER</p>
             <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{lastBooking.customerName}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #eee', borderBottom: '2px dashed #eee', padding: '15px 5px', marginBottom: '20px' }}>
             <div>
               <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>TICKET TYPE</p>
               <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{lastBooking.qty}x {lastBooking.tierName}</p>
             </div>
             <div style={{ textAlign: 'right' }}>
               <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>TOTAL PAID</p>
               <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>₹{lastBooking.totalAmount}</p>
             </div>
          </div>
          <div style={{ textAlign: 'center' }}>
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://paadukundam-dhaaa.vercel.app/ticket/' + lastBooking.bookingRef.replace('#', ''))}`} alt="QR" style={{ width: '120px', height: '120px', margin: '0 auto', border: '1px solid #eee', padding: '5px', borderRadius: '8px' }} />
             <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666', fontWeight: 'bold', letterSpacing: '2px' }}>{lastBooking.bookingRef}</p>
          </div>
        </div>
      </div>
    )}

    {/* THERMAL RECEIPT (Hidden on screen) */}
    {lastBooking && (
      <div className="hidden thermal-receipt flex-col text-center" style={{ display: 'none' }}>
        <h2 className="font-bold text-lg mb-1">{lastBooking.eventName}</h2>
        <p className="text-xs border-b border-black border-dashed pb-2 mb-2">Box Office Booking</p>
        
        <div className="text-left text-xs space-y-1 mb-2 border-b border-black border-dashed pb-2">
          <p><strong>Ref:</strong> {lastBooking.bookingRef}</p>
          <p><strong>Date:</strong> {lastBooking.date}</p>
          <p><strong>Name:</strong> {lastBooking.customerName}</p>
          <p><strong>Pay:</strong> {lastBooking.paymentMethod.toUpperCase()}</p>
        </div>
        
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>{lastBooking.qty}x {lastBooking.tierName}</span>
          <span>Rs. {lastBooking.totalAmount}</span>
        </div>
        
        <p className="text-[10px] mt-4 italic">Thank you for your purchase!</p>
        <p className="text-[10px] italic">Powered by Paadukundam Dhaa</p>
      </div>
    )}

    <div className="space-y-6 max-w-4xl mx-auto print:hidden">
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
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary text-black bg-white"
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
                      className="w-10 h-10 rounded-lg bg-gray-100 text-black flex items-center justify-center font-bold hover:bg-gray-200"
                    >-</button>
                    <div className="w-16 h-10 flex items-center justify-center text-black font-black text-xl border border-gray-200 rounded-lg">
                      {qty}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setQty(Math.min(availableTickets, qty + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 text-black flex items-center justify-center font-bold hover:bg-gray-200"
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
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm text-black bg-white"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-black bg-white"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-black bg-white"
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
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg border text-xs font-bold transition-colors ${
                    paymentMethod === 'razorpay' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <QrCode size={18} className="mb-1" /> Online (Razorpay)
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

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoCheckin}
                    onChange={(e) => setAutoCheckin(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" 
                  />
                  <span className="text-sm font-bold text-gray-700">Auto Check-in <span className="text-xs font-normal text-gray-500">(Admit instantly)</span></span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    disabled={!customerEmail}
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" 
                  />
                  <span className={`text-sm font-bold ${customerEmail ? 'text-gray-700' : 'text-gray-400'}`}>Send Ticket via Email <span className="text-xs font-normal text-gray-500">(Requires Email Address)</span></span>
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
            {selectedTier && <p className="text-xs text-gray-500 font-bold mt-1">Includes ₹{platformFee} platform fee</p>}
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
    </>
  );
}
