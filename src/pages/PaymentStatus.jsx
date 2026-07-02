import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double verification on strict mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyTransaction = async () => {
      const searchParams = new URLSearchParams(location.search);
      const transactionId = searchParams.get('transactionId');
      // PhonePe might pass code=PAYMENT_SUCCESS or we just rely on backend status check

      const storedData = localStorage.getItem('phonePeCheckoutData');
      if (!storedData || !transactionId) {
        setStatus('error');
        return;
      }

      let checkoutData;
      try {
        checkoutData = JSON.parse(storedData);
      } catch (e) {
        setStatus('error');
        return;
      }

      try {
        // 1. Verify Payment Securely on Backend
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: transactionId,
            reservations: checkoutData.reservations
          })
        });

        if (!verifyResponse.ok) {
          throw new Error('Payment verification failed or was cancelled.');
        }

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          setStatus('success');
          
          // Use the real booking_ref from the database (returned by server after confirm_tickets)
          const bookingRef = verifyData.bookings?.[0]?.booking_ref || '#BK-' + Math.floor(100000 + Math.random() * 900000);

          // 4. Send Confirmation Email
          try {
            fetch('/api/send-ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: checkoutData.email,
                name: checkoutData.firstName,
                eventTitle: checkoutData.event.title,
                eventDate: checkoutData.event.date,
                eventVenue: checkoutData.event.venue,
                eventCity: checkoutData.event.city,
                bookingRef: bookingRef,
                qty: checkoutData.totalTickets,
                amount: checkoutData.grandTotal,
                subtotal: checkoutData.subtotalBeforeDiscount,
                discount: checkoutData.promoDiscountAmount,
                platformFee: checkoutData.bookingFee,
                termsAndConditions: checkoutData.event.termsAndConditions
              })
            }).catch(err => console.error("Email send API failed:", err));
          } catch (e) {
            console.error("Email notification error", e);
          }

          // Increment promo usage if a promo was applied
          if (checkoutData.appliedPromo?.id) {
            fetch('/api/increment-promo-usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ promoCodeId: checkoutData.appliedPromo.id })
            }).catch(e => console.error('Promo usage increment failed:', e));
          }

          // Navigate to Success
          setTimeout(() => {
            localStorage.removeItem('phonePeCheckoutData');
            navigate('/success', {
              state: {
                bookingRef: bookingRef,
                event: checkoutData.event,
                tickets: checkoutData.totalTickets,
                amount: checkoutData.grandTotal,
                email: checkoutData.email
              },
              replace: true
            });
          }, 1500);
          
        } else {
          throw new Error('Payment failed');
        }

      } catch (error) {
        console.error('Error processing booking:', error);
        setStatus('failed');
        
        // Release reservations if it failed
        fetch('/api/release-tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservations: checkoutData.reservations })
        }).catch(e => console.error("Failed to release tickets:", e));

        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: error.message || 'Your payment was not successful or was cancelled.',
          confirmButtonColor: '#e11d48'
        }).then(() => {
          localStorage.removeItem('phonePeCheckoutData');
          navigate('/', { replace: true });
        });
      }
    };

    verifyTransaction();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-gray-100">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-20 h-20 text-primary mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-black text-black mb-2">Verifying Payment</h2>
            <p className="text-gray-500">Please do not close or refresh this page.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-black mb-2">Payment Successful!</h2>
            <p className="text-gray-500">Generating your tickets...</p>
          </>
        )}

        {(status === 'failed' || status === 'error') && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-black mb-2">Payment Failed</h2>
            <p className="text-gray-500">We couldn't confirm your payment.</p>
          </>
        )}
      </div>
    </div>
  );
}
