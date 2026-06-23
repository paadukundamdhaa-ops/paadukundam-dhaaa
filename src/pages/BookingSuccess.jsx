import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingSuccess() {
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#710D10', '#F5C624', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#710D10', '#F5C624', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 container mx-auto px-6 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-dark max-w-2xl w-full p-10 rounded-3xl border border-white/10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        
        <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-pale text-lg mb-8">Your booking for <strong className="text-white">The Weekend Stadium Tour</strong> is confirmed.</p>
        
        <div className="bg-black/50 rounded-2xl p-6 mb-8 inline-block text-left w-full max-w-md border border-white/5">
          <div className="flex justify-between mb-2">
            <span className="text-pale">Booking ID</span>
            <span className="font-mono font-bold text-secondary">#LV-983204</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-pale">Tickets</span>
            <span className="font-bold">2 x VIP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pale">Total Paid</span>
            <span className="font-bold">$670.00</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <button className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20">
            <Download size={18} className="mr-2" /> Download E-Ticket
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20">
            <Share2 size={18} className="mr-2" /> Share with Friends
          </button>
        </div>

        <Link to="/dashboard" className="inline-flex items-center text-secondary hover:text-white transition-colors">
          View all your tickets <ArrowRight size={16} className="ml-2" />
        </Link>
      </motion.div>
    </div>
  );
}
