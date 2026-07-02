import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, MapPin, Calendar, Clock, User, Mail, Phone, Ticket, Download, Share2 } from 'lucide-react';
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
  const [ticketImage, setTicketImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        let bookings = [];
        
        if (bookingRef.startsWith('tx_')) {
          const intentId = bookingRef.substring(3);
          const { data, error } = await supabase
            .from('bookings')
            .select('*, events(*), profiles(*), ticket_tiers(*)')
            .eq('payment_intent_id', intentId);
          if (error) throw error;
          bookings = data || [];
        } else {
          const searchRef = bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`;
          const { data, error } = await supabase
            .from('bookings')
            .select('*, events(*), profiles(*), ticket_tiers(*)')
            .eq('booking_ref', searchRef);
          if (error) throw error;
          bookings = data || [];
        }

        if (bookings.length === 0) {
          throw new Error("No tickets found");
        }

        const firstBooking = bookings[0];
        
        const combinedBooking = {
          ...firstBooking,
          qty: bookings.reduce((sum, b) => sum + (b.qty || 1), 0),
          booking_ref: bookingRef, // Keep original url param
          tiers: bookings.map(b => ({
            name: b.ticket_tiers?.tier_name || 'General Admission',
            qty: b.qty || 1
          }))
        };
        
        setBooking(combinedBooking);
      } catch (err) {
        console.error("Error fetching ticket:", err);
        setError("Invalid or Not Found. This ticket does not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingRef]);

  // Handle auto-download or view image from email link
  useEffect(() => {
    if (booking && !loading) {
      const searchParams = new URLSearchParams(location.search);
      const isDownload = searchParams.get('download') === 'true';
      const isViewImage = searchParams.get('view') === 'image';

      if (isDownload || isViewImage) {
        setGeneratingImage(true);
        // Wait for fonts and images to load fully
        setTimeout(() => {
          if (ticketRef.current) {
            html2canvas(ticketRef.current, { 
              backgroundColor: '#f9fafb',
              scale: 2,
              useCORS: true,
              allowTaint: true
            }).then((canvas) => {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
              if (isDownload) {
                const link = document.createElement('a');
                link.download = `ticket-${bookingRef}.jpg`;
                link.href = dataUrl;
                link.click();
              }
              setTicketImage(dataUrl);
              setGeneratingImage(false);
            }).catch(err => {
              console.error("Canvas error:", err);
              setGeneratingImage(false);
            });
          }
        }, 1200);
      }
    }
  }, [booking, loading, location, bookingRef]);

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
  
  // Format Date and Time
  const eventDateObj = new Date(event.event_date || booking.created_at);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = event.event_time?.substring(0, 5) || '18:00';
  const tierName = booking.ticket_tiers?.tier_name || 'GENERAL ADMISSION';
  const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const ticketUrl = `${baseUrl}/ticket/${bookingRef.replace('#', '')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketUrl)}`;

  if (ticketImage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <img src={ticketImage} alt="Your Ticket" className="max-w-md w-full h-auto drop-shadow-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 font-sans flex flex-col items-center justify-center p-4 md:p-6 relative">
      {generatingImage && (
        <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#cc0000] border-t-transparent mb-4"></div>
            <p className="text-gray-500 font-bold">Preparing your ticket image...</p>
          </div>
        </div>
      )}
      
      {/* --- ACTUAL TICKET TO CAPTURE --- */}
      <div className="max-w-[400px] w-full bg-white rounded-[2rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)]" ref={ticketRef}>
        
        {/* Logo Section */}
        <div className="pt-8 pb-6 flex justify-center bg-white">
          <img src="/images/LOGO __ Option 02.png" alt="PaadukundamDhaa Logo" className="h-14 object-contain" crossOrigin="anonymous" />
        </div>

        {/* Event Image Section */}
        <div className="relative h-64 w-full bg-gray-900">
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-5 left-6 right-6 text-left">
            <div className="inline-block bg-[#cc0000] text-white text-[11px] font-black px-2.5 py-1 rounded-md mb-2 tracking-wider">
              ACTIVE
            </div>
            <h2 className="text-2xl md:text-[26px] font-black text-white mb-2.5 leading-tight">{event.title}</h2>
            
            <div className="flex items-center text-gray-200 text-[13px] font-medium mb-1.5 gap-2">
              <Calendar size={14} className="text-[#cc0000]" />
              <span>{formattedDate} | {formattedTime}</span>
            </div>
            
            <div className="flex items-start text-gray-200 text-[13px] font-medium gap-2">
              <MapPin size={14} className="text-[#cc0000] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>

        {/* Divider with Cutouts */}
        <div className="relative flex items-center bg-white h-10">
          <div className="absolute -left-5 w-10 h-10 bg-gray-100 rounded-full shadow-inner border-r border-gray-100"></div>
          <div className="w-full border-t-2 border-dashed border-gray-300 mx-8"></div>
          <div className="absolute -right-5 w-10 h-10 bg-gray-100 rounded-full shadow-inner border-l border-gray-100"></div>
        </div>

        {/* Bottom Section */}
        <div className="px-6 pb-8 bg-white flex items-center justify-between gap-5">
          {/* QR Code */}
          <div className="w-[120px] h-[120px] shrink-0 border-2 border-gray-100 rounded-2xl p-2.5 shadow-sm bg-white flex items-center justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" crossOrigin="anonymous" />
          </div>

          {/* Ticket Info */}
          <div className="flex-1 flex flex-col items-end text-right">
            <h3 className="text-[#cc0000] font-black tracking-[0.2em] text-[11px] mb-1.5">ENTRY PASS</h3>
            <h4 className="text-xl font-black text-black leading-tight mb-1 uppercase text-right" style={{ wordBreak: 'break-word' }}>
              {booking.tiers?.map((t, idx) => (
                <div key={idx}>{t.qty}x {t.name}</div>
              ))}
            </h4>
            <p className="text-gray-500 font-medium text-[13px] mb-4">{booking.qty} Ticket(s)</p>

            <div className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 w-full shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 text-center">Booking ID</p>
              <p className="text-lg font-black text-black text-center leading-none">{booking.booking_ref}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons (Outside the ticket image) */}
      <div className="max-w-[400px] w-full mt-6 flex items-center justify-center gap-4 px-2">
        <button 
          onClick={downloadTicket}
          className="flex-1 flex items-center justify-center gap-2 bg-[#cc0000] text-white px-4 py-3.5 rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-md"
        >
          <Download size={18} /> Save
        </button>
        <Link 
          to={`/events/${event.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-md"
        >
          Details
        </Link>
        <button 
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: 'My Ticket',
                  text: `I'm going to ${event.title}!`,
                  url: ticketUrl,
                });
              } else {
                await navigator.clipboard.writeText(ticketUrl);
                alert('Link copied to clipboard!');
              }
            } catch (error) {
              console.log('Error sharing:', error);
            }
          }}
          className="w-[52px] h-[52px] flex items-center justify-center shrink-0 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors shadow-md"
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}
