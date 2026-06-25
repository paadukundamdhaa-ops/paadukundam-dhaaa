import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, MapPin, Calendar, Clock, User, Mail, Phone, Ticket, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

export default function TicketVerify() {
  const { bookingRef } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ticketRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const searchRef = bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`;
        
        const { data, error } = await supabase
          .from('bookings')
          .select('*, events(*), profiles(*), ticket_tiers(*)')
          .eq('booking_ref', searchRef)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Invalid or Not Found. This ticket does not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingRef]);

  // Handle auto-download from email link
  useEffect(() => {
    if (booking && !loading) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('download') === 'true') {
        Swal.fire({
          title: 'Ticket Ready',
          text: 'Your ticket is ready! Click the button below to save it to your device.',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Download Ticket',
          cancelButtonText: 'View Only',
          confirmButtonColor: '#e11d48'
        }).then((result) => {
          if (result.isConfirmed) {
            downloadTicket();
          }
        });
      }
    }
  }, [booking, loading, location]);

  const downloadTicket = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current, { 
        backgroundColor: '#f9fafb', // Match bg-gray-50
        scale: 2 // Higher resolution
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `ticket-${bookingRef}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-bold">Verifying ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-red-100">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-black mb-2">Ticket Invalid</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <Link to="/" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const event = booking.events;
  const profile = booking.profiles;
  const eventDate = new Date(event.event_date || booking.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full" ref={ticketRef}>
        {/* Verification Status */}
        <div className="bg-green-500 text-white p-6 rounded-t-3xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <CheckCircle className="w-16 h-16 mx-auto mb-3" />
            <h1 className="text-2xl font-black mb-1">Valid Ticket</h1>
            <p className="text-green-100 font-medium text-sm">Verified and confirmed for entry</p>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        {/* Details Container */}
        <div className="bg-white rounded-b-3xl shadow-xl shadow-gray-200/50 p-6 border-b border-l border-r border-gray-100 border-t-2 border-t-dashed">
          
          <div className="mb-6 border-b border-gray-100 pb-6 text-center">
            <h2 className="text-xl font-black text-black mb-2">{event.title}</h2>
            <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Booking Ref: {booking.booking_ref}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Details</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{eventDate}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{event.event_time?.substring(0, 5) || 'TBA'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{event.venue}, {event.city}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attendee Details</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-black">{profile?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-600">{profile?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-600">{profile?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Order Summary</h3>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-black">{booking.ticket_tiers?.tier_name || 'General Admission'} ({booking.qty}x)</span>
                  </div>
                  <span className="text-sm font-bold text-black">₹{(booking.ticket_tiers?.price * booking.qty) || booking.total_amount}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-bold text-black">₹15</span>
                </div>

                {((booking.ticket_tiers?.price * booking.qty) + 15) > booking.total_amount && (
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-green-600 font-bold">Discount Applied</span>
                    <span className="font-bold text-green-600">-₹{((booking.ticket_tiers?.price * booking.qty) + 15) - booking.total_amount}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                  <span className="text-sm font-bold text-black">Total Paid</span>
                  <span className="text-lg font-black text-primary">₹{booking.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Download Button (Outside the ticket image) */}
      <button 
        onClick={downloadTicket}
        className="mt-8 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
      >
        <Download size={20} /> Download Ticket (JPG)
      </button>
    </div>
  );
}
