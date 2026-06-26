import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingSuccess() {
  const location = useLocation();
  const { bookingRef, event, totalTickets, grandTotal } = location.state || {
    bookingRef: '#BK-000000',
    event: { title: 'Unknown Event' },
    totalTickets: 0,
    grandTotal: 0
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#D4AF37', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#D4AF37', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 font-sans bg-black flex items-center justify-center px-6 relative">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-gray-900/90 backdrop-blur-xl max-w-2xl w-full p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl text-center relative overflow-hidden z-10"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-dark via-primary to-primary-light"></div>
        
        <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-400 text-lg mb-8 font-medium">Your booking for <strong className="text-white">{event.title}</strong> is confirmed.</p>
        
        <div className="bg-black/50 rounded-2xl p-6 mb-8 inline-block text-left w-full max-w-md border border-gray-800 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Booking ID</span>
            <span className="font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Tickets</span>
            <span className="font-black text-white">{totalTickets} Ticket{totalTickets > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-800/50 mt-2">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Total Paid</span>
            <span className="font-black text-2xl text-white">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] transform hover:scale-[1.02] active:scale-95">
            <Download size={18} className="mr-2" /> Download E-Ticket
          </Link>
          <button 
            onClick={async () => {
              try {
                const shareUrl = window.location.origin + '/events';
                if (navigator.share) {
                  await navigator.share({
                    title: 'I just booked tickets!',
                    text: `I just got my tickets for ${event.title}! Join me!`,
                    url: shareUrl,
                  });
                } else {
                  await navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }
              } catch (error) {
                console.log('Error sharing:', error);
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-white font-black rounded-xl transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <Share2 size={18} className="mr-2" /> Share with Friends
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4 border-t border-gray-800/50">
          <Link to="/events" className="inline-flex items-center text-gray-400 font-bold hover:text-white transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Events
          </Link>
          <Link to="/dashboard" className="inline-flex items-center text-primary font-bold hover:text-primary-light transition-colors">
            View all your tickets <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
