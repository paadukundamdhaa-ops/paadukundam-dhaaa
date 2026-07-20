import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Info, ShieldCheck, Ticket, CreditCard, Wallet, Lock, ArrowLeft, Tag } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';

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

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [checkoutData, setCheckoutData] = useState(() => {
    if (state) return state;
    const pending = localStorage.getItem('pendingCheckout');
    if (pending) {
      try {
        return JSON.parse(pending);
      } catch(e) {}
    }
    return null;
  });

  const [user, setUser] = useState(null);
  
  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Ticket State (Initialize from location state or localStorage if available)
  const [selectedTickets, setSelectedTickets] = useState(checkoutData?.selectedTickets || {});
  
  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cash'
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // If user leaves page while processing payment, we can't reliably catch it,
    // but the backend cron job will clean up expired reservations.
  }, []);

  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!checkoutData) {
      navigate('/events');
      return;
    }

    // Clear it out so we don't accidentally load it again on subsequent unrelated visits
    localStorage.removeItem('pendingCheckout');
    
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
  }, [checkoutData, navigate]);

  if (!checkoutData) return null;

  const { event, allTicketsInfo } = checkoutData;

  // Calculate derived state dynamically
  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const subtotalBeforeDiscount = allTicketsInfo.reduce((total, ticket) => total + (selectedTickets[ticket.id] || 0) * ticket.price, 0);
  
  const promoDiscountAmount = appliedPromo ? Math.round(subtotalBeforeDiscount * (appliedPromo.discount_percentage / 100)) : 0;
  const discountedSubtotal = subtotalBeforeDiscount - promoDiscountAmount;

  // Calculate fees
  const bookingFee = 15 * totalTickets; // ₹15 flat fee per ticket
  const grandTotal = discountedSubtotal + bookingFee;

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

      // Update Profile with Phone Number first
      const fullName = `${firstName} ${lastName}`.trim();
      await supabase.from('profiles').upsert({ id: currentUser.id, name: fullName, email, phone });

      setIsProcessing(true);

      if (paymentMethod === 'cash') {
        const cashResponse = await fetch('/api/checkout-cash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            selectedTickets: selectedTickets,
            userId: currentUser.id,
            promoCode: appliedPromo?.code || null
          })
        });

        if (!cashResponse.ok) {
          const errData = await cashResponse.json();
          throw new Error(errData.error || 'Failed to complete cash checkout');
        }

        const cashData = await cashResponse.json();
        
        // Trigger Email Notification (same as backend does on verify-payment redirect)
        const bookingRef = cashData.bookings?.[0]?.booking_ref || '#BK-' + Math.floor(100000 + Math.random() * 900000);
        try {
          fetch('/api/send-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              name: firstName,
              eventTitle: event.title,
              eventDate: event.date,
              eventVenue: event.venue,
              eventCity: event.city,
              bookingRef: bookingRef,
              qty: totalTickets,
              amount: grandTotal,
              subtotal: subtotalBeforeDiscount,
              discount: promoDiscountAmount,
              platformFee: bookingFee,
              termsAndConditions: event.termsAndConditions
            })
          }).catch(err => console.error("Email send API failed:", err));
        } catch (e) {
          console.error("Email notification error", e);
        }

        // Increment promo usage if applicable
        if (appliedPromo?.id) {
          fetch('/api/increment-promo-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoCodeId: appliedPromo.id })
          }).catch(e => console.error('Promo usage increment failed:', e));
        }

        setIsProcessing(false);
        Swal.fire({
          icon: 'success',
          title: 'Booking Confirmed!',
          text: 'Your ticket has been booked successfully (Paid with Cash).',
          confirmButtonColor: '#22c55e',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          navigate('/success', {
            state: {
              bookingRef: bookingRef,
              event: event,
              totalTickets: totalTickets,
              grandTotal: grandTotal,
              email: email
            },
            replace: true
          });
        });
        return;
      }

      // Online checkout
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const initResponse = await fetch('/api/init-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          selectedTickets: selectedTickets,
          userId: currentUser.id,
          promoCode: appliedPromo?.code || null   // backend validates this
        }),
      });

      if (!initResponse.ok) {
        const errData = await initResponse.json();
        throw new Error(errData.error || 'Failed to initialize checkout');
      }

      const initData = await initResponse.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: initData.amount * 100,
        currency: initData.currency,
        name: "PaadukundamDhaa",
        description: `Tickets for ${event.title}`,
        order_id: initData.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                reservations: initData.reservations
              })
            });

            if (!verifyResponse.ok) {
              const errData = await verifyResponse.json();
              throw new Error(errData.error || 'Payment verification failed');
            }
            
            const verifyData = await verifyResponse.json();
            const bookingRef = verifyData.bookings?.[0]?.booking_ref || '#BK-' + Math.floor(100000 + Math.random() * 900000);
            
            // Trigger Email Notification
            try {
              fetch('/api/send-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  name: firstName,
                  eventTitle: event.title,
                  eventDate: event.date,
                  eventVenue: event.venue,
                  eventCity: event.city,
                  bookingRef: bookingRef,
                  qty: totalTickets,
                  amount: grandTotal,
                  subtotal: subtotalBeforeDiscount,
                  discount: promoDiscountAmount,
                  platformFee: bookingFee,
                  termsAndConditions: event.termsAndConditions
                })
              }).catch(err => console.error("Email send API failed:", err));
            } catch (e) {
              console.error("Email notification error", e);
            }

            // Increment promo usage if applicable
            if (appliedPromo?.id) {
              fetch('/api/increment-promo-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoCodeId: appliedPromo.id })
              }).catch(e => console.error('Promo usage increment failed:', e));
            }

            setIsProcessing(false);
            Swal.fire({
              icon: 'success',
              title: 'Booking Confirmed!',
              text: 'Your ticket has been booked successfully.',
              confirmButtonColor: '#22c55e',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              navigate('/success', {
                state: {
                  bookingRef: bookingRef,
                  event: event,
                  totalTickets: totalTickets,
                  grandTotal: grandTotal,
                  email: email
                },
                replace: true
              });
            });

          } catch (err) {
             Swal.fire({ icon: 'error', title: 'Verification Failed', text: err.message, confirmButtonColor: '#e11d48' });
             setIsProcessing(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: "#e11d48" // primary brand color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setIsProcessing(false);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: response.error.description || 'Payment was failed or cancelled.',
          confirmButtonColor: '#e11d48'
        });
      });
      
      // Open the Razorpay Popup
      rzp.open();

    } catch (error) {
      console.error('Error initializing checkout:', error);
      setIsProcessing(false);
      Swal.fire({
        icon: 'error',
        title: 'Checkout Failed',
        text: error.message || 'Something went wrong while completing your checkout.',
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all outline-none ${paymentMethod === 'online' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className={paymentMethod === 'online' ? 'text-primary' : 'text-gray-400'} size={20} />
                    <span className="font-bold text-sm text-black">Pay Online</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">Pay securely via UPI, Cards, Netbanking, or Wallets (Razorpay).</p>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all outline-none ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className={paymentMethod === 'cash' ? 'text-primary' : 'text-gray-400'} size={20} />
                    <span className="font-bold text-sm text-black">Cash / Testing Option</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">Confirm instantly. Pay cash at the event. Ideal for website testing.</p>
              </button>
            </div>

            {paymentMethod === 'online' ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ShieldCheck size={48} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg text-black mb-2">Secure Payment Gateway</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Clicking "Pay Now" will open the secure Razorpay portal where you can pay via UPI, Credit/Debit Cards, Netbanking, or Wallets.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <CreditCard className="text-gray-400" size={24} />
                  <Wallet className="text-gray-400" size={24} />
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <ShieldCheck size={48} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-black mb-2">Cash Payment Selection</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  You are completing checkout with the **Cash Payment** option.
                </p>
                <p className="text-xs text-green-700 font-bold leading-relaxed">
                  Your ticket will be confirmed instantly. Bring the generated ticket reference to the event counter to pay by cash.
                </p>
              </div>
            )}
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
                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-black uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    className="whitespace-nowrap flex-shrink-0 bg-black hover:bg-gray-800 text-white font-bold text-sm px-5 py-2 rounded-xl transition-all disabled:opacity-50"
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
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Platform Fee (₹15 × {totalTickets})</span>
                <span className="font-bold text-black">₹{bookingFee.toLocaleString()}</span>
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

             <button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="block w-full py-4 text-center bg-primary hover:bg-primary-dark text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 flex justify-center items-center disabled:opacity-50"
            >
              {isProcessing ? (
                'Processing...'
              ) : paymentMethod === 'cash' ? (
                <>Confirm Booking (Cash) <Ticket className="ml-2" size={20} /></>
              ) : (
                <>Pay ₹{grandTotal.toLocaleString()} <Ticket className="ml-2" size={20} /></>
              )}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
