import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Info, ShieldCheck, Ticket, CreditCard, Wallet, Lock, ArrowLeft, Tag } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Ticket State (Initialize from location state if available)
  const [selectedTickets, setSelectedTickets] = useState(state?.selectedTickets || {});
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!state) {
      navigate('/events');
      return;
    }
    
    // Fetch logged in user to pre-fill info
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        const nameParts = (user.user_metadata?.full_name || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        // We would fetch phone from profiles table here if it existed
      }
    };
    fetchUser();
  }, [state, navigate]);

  if (!state) return null;

  const { event, allTicketsInfo } = state;

  // Calculate derived state dynamically
  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const subtotalBeforeDiscount = allTicketsInfo.reduce((total, ticket) => total + (selectedTickets[ticket.id] || 0) * ticket.price, 0);
  
  const promoDiscountAmount = appliedPromo ? Math.round(subtotalBeforeDiscount * (appliedPromo.discount_percentage / 100)) : 0;
  const discountedSubtotal = subtotalBeforeDiscount - promoDiscountAmount;

  // Calculate fees
  const bookingFee = totalTickets * 50; // ₹50 per ticket flat fee
  const taxes = Math.round((discountedSubtotal + bookingFee) * 0.18); // 18% GST
  const grandTotal = discountedSubtotal + bookingFee + taxes;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      const code = promoInput.toUpperCase().trim();
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .single();
        
      if (error || !data) {
        Swal.fire({ icon: 'error', title: 'Invalid Code', text: 'This promo code does not exist.', confirmButtonColor: '#e11d48' });
        return;
      }
      
      if (data.status !== 'Active') {
        Swal.fire({ icon: 'warning', title: 'Inactive Code', text: 'This promo code is no longer active.', confirmButtonColor: '#e11d48' });
        return;
      }
      
      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        Swal.fire({ icon: 'warning', title: 'Limit Reached', text: 'This promo code has reached its maximum usage limit.', confirmButtonColor: '#e11d48' });
        return;
      }
      
      if (data.event_id && data.event_id !== event.id) {
        Swal.fire({ icon: 'warning', title: 'Not Applicable', text: 'This promo code cannot be applied to this event.', confirmButtonColor: '#e11d48' });
        return;
      }
      
      setAppliedPromo(data);
      setPromoInput('');
      Swal.fire({ icon: 'success', title: 'Applied!', text: `${data.discount_percentage}% discount applied to your tickets.`, timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleTicketChange = (ticketId, delta) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [ticketId]: next };
    });
  };

  const handlePayment = async () => {
    if (totalTickets === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please select at least one ticket.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }
    if (!firstName || !email || !phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Details',
        text: 'Please fill in all personal information before paying.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        Swal.fire({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Please log in to complete checkout.',
          confirmButtonColor: '#e11d48'
        });
        navigate('/login');
        return;
      }

      // 1. Update Profile with Phone Number
      const fullName = `${firstName} ${lastName}`.trim();
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: currentUser.id, name: fullName, email, phone });
      
      if (profileError) {
        console.error("Profile error:", profileError);
        // Continue anyway as profile update isn't strictly blocking
      }

      // Generate event-specific Booking Reference
      const getInitials = (title) => {
        if (!title) return 'BK';
        return title.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4);
      };
      
      const eventInitials = getInitials(event.title);
      const bookingRef = `#${eventInitials}-` + Math.floor(100000 + Math.random() * 900000);

      // Find primary ticket tier (the first one they selected)
      const primaryTicketTierId = Object.keys(selectedTickets).find(id => selectedTickets[id] > 0);

      // 3. Save Booking to Database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_ref: bookingRef,
          user_id: currentUser.id,
          event_id: event.id,
          ticket_tier_id: primaryTicketTierId || null,
          qty: totalTickets,
          total_amount: grandTotal,
          status: 'Completed'
        });

      if (bookingError) throw bookingError;

      // 3.5 Increment promo code usage if applied
      if (appliedPromo) {
        const { error: promoError } = await supabase
          .from('promo_codes')
          .update({ current_uses: appliedPromo.current_uses + 1 })
          .eq('id', appliedPromo.id);
          
        if (promoError) console.error("Failed to update promo uses:", promoError);
      }

      // 4. Send Confirmation Email via Serverless API
      try {
        fetch('/api/send-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: firstName,
            eventTitle: event.title,
            eventDate: event.date,
            bookingRef: bookingRef,
            qty: totalTickets,
            amount: grandTotal
          })
        }).catch(err => console.error("API error:", err));
      } catch (emailError) {
        console.error("Failed to trigger email send:", emailError);
      }

      // Navigate to Success
      navigate('/success', { 
        state: { 
          bookingRef, 
          event, 
          totalTickets, 
          grandTotal 
        } 
      });

    } catch (error) {
      console.error("Checkout failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: 'Failed to process booking. Please try again.',
        confirmButtonColor: '#e11d48'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-700 bg-gray-100 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-black">Secure Checkout</h1>
        </div>
        <div className="flex items-center text-sm font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">
          <ShieldCheck size={16} className="mr-1.5" /> 100% Safe
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Forms */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Personal Info Box */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-black mb-6">Personal Information</h2>
            <p className="text-sm text-gray-500 mb-6">Your tickets will be sent to these details.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">First Name *</label>
                <input 
                  type="text" 
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="John" 
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="Doe" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address *</label>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="john@example.com" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone Number *</label>
                <input 
                  type="tel" 
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                  placeholder="+91 98765 43210" 
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-black mb-6">Payment Method</h2>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-center p-4 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer transition-all">
                <input type="radio" name="payment" defaultChecked className="mr-4 w-5 h-5 accent-primary" />
                <CreditCard className="mr-3 text-primary" size={24} />
                <div>
                  <span className="block font-bold text-black text-base">Credit / Debit Card</span>
                  <span className="block text-xs text-gray-500">Visa, Mastercard, RuPay</span>
                </div>
              </label>
              
              <label className="flex items-center p-4 border-2 border-gray-100 hover:border-gray-200 bg-white rounded-2xl cursor-pointer transition-all opacity-60">
                <input type="radio" name="payment" className="mr-4 w-5 h-5 accent-primary" disabled />
                <Wallet className="mr-3 text-gray-500" size={24} />
                <div>
                  <span className="block font-bold text-black text-base">UPI / Digital Wallet</span>
                  <span className="block text-xs text-gray-500">Coming Soon</span>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">CVV</label>
                  <input type="password" placeholder="•••" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Order Summary Box */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 lg:sticky lg:top-24">
            <h3 className="font-black text-xl text-black mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
            
            {/* Event Info */}
            <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
              <img src={event.heroImage} className="w-20 h-24 rounded-xl object-cover shadow-sm" alt={event.title} />
              <div>
                <h4 className="font-bold text-lg text-black leading-tight mb-2">{event.title}</h4>
                <p className="text-xs font-bold text-gray-500 mb-1 flex items-center"><Calendar size={12} className="mr-1"/> {event.date}</p>
                <p className="text-xs font-bold text-gray-500 flex items-center"><MapPin size={12} className="mr-1"/> {event.venue}, {event.city}</p>
              </div>
            </div>

            {/* Tickets Breakdown */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tickets</h4>
              {allTicketsInfo.filter(t => selectedTickets[t.id] > 0).map(ticket => (
                <div key={ticket.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="font-bold text-sm text-black block">{ticket.name}</span>
                    <span className="text-xs text-gray-500 font-bold">₹{ticket.price.toLocaleString()} each</span>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                      <button 
                        onClick={() => handleTicketChange(ticket.id, -1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-primary font-bold hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-sm font-black text-black">{selectedTickets[ticket.id]}</span>
                      <button 
                        onClick={() => handleTicketChange(ticket.id, 1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-primary font-bold hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-sm text-black w-16 text-right">₹{(ticket.price * selectedTickets[ticket.id]).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className="mb-6 border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Promo Code</h4>
              {appliedPromo ? (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-xl">
                  <div>
                    <span className="font-black text-green-700 flex items-center gap-1.5"><Tag size={14}/> {appliedPromo.code} Applied</span>
                    <span className="text-xs font-bold text-green-600 block mt-0.5">{appliedPromo.discount_percentage}% off on tickets</span>
                  </div>
                  <button onClick={handleRemovePromo} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoInput} 
                    onChange={e => setPromoInput(e.target.value)} 
                    placeholder="Enter discount code" 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-black uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    className="bg-black hover:bg-gray-800 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-3 mb-6 text-sm font-medium text-gray-600 border-t border-gray-100 pt-6">
              <div className="flex justify-between">
                <span>Tickets Subtotal</span>
                <span className="font-bold text-black">₹{subtotalBeforeDiscount.toLocaleString()}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedPromo.discount_percentage}%)</span>
                  <span className="font-bold">-₹{promoDiscountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Platform Booking Fee</span>
                <span className="font-bold text-black">₹{bookingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="font-bold text-black">₹{taxes.toLocaleString()}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-6 mb-8">
              <span className="font-black text-lg text-black">Total Amount</span>
              <span className="font-black text-3xl text-primary">₹{grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 mb-6 justify-center">
              <Lock size={14} className="text-green-500" />
              <span>Payments are secure and encrypted</span>
            </div>

            <button onClick={handlePayment} className="block w-full py-4 text-center bg-primary hover:bg-primary-dark text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 flex justify-center items-center">
              Pay ₹{grandTotal.toLocaleString()} <Ticket className="ml-2" size={20} />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
