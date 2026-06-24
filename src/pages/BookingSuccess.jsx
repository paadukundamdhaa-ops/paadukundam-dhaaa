import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen pt-32 pb-24 font-sans bg-gray-50 flex items-center justify-center px-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white max-w-2xl w-full p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary-light to-primary"></div>
        
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-black mb-4">Payment Successful!</h1>
        <p className="text-gray-600 text-lg mb-8 font-medium">Your booking for <strong className="text-black">{event.title}</strong> is confirmed.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 inline-block text-left w-full max-w-md border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Booking ID</span>
            <span className="font-mono font-black text-primary">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Tickets</span>
            <span className="font-black text-black">{totalTickets} Ticket{totalTickets > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Total Paid</span>
            <span className="font-black text-xl text-black">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-primary hover:bg-primary-dark text-white font-black rounded-xl transition-all shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95">
            <Download size={18} className="mr-2" /> Download E-Ticket
          </Link>
          <button className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-white border border-gray-200 hover:border-gray-300 text-black font-black rounded-xl transition-all shadow-sm transform hover:scale-[1.02] active:scale-95">
            <Share2 size={18} className="mr-2" /> Share with Friends
          </button>
        </div>

        <Link to="/dashboard" className="inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors">
          View all your tickets <ArrowRight size={18} className="ml-2" />
        </Link>
      </motion.div>
    </div>
  );
}
