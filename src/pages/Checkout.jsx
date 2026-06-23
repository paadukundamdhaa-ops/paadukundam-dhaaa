import { Link } from 'react-router-dom';
import { CreditCard, Wallet, Lock, Ticket } from 'lucide-react';

export default function Checkout() {
  return (
    <div className="pt-24 pb-20 min-h-screen container mx-auto px-6">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info */}
          <section className="glass-dark p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-pale mb-2">First Name</label>
                <input type="text" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" defaultValue="John" />
              </div>
              <div>
                <label className="block text-sm text-pale mb-2">Last Name</label>
                <input type="text" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" defaultValue="Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-pale mb-2">Email Address</label>
                <input type="email" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" defaultValue="john@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-pale mb-2">Phone Number</label>
                <input type="tel" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="glass-dark p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Payment Method</h2>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-center p-4 border border-secondary bg-white/5 rounded-xl cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="mr-4 accent-primary" />
                <CreditCard className="mr-3" />
                <span className="font-semibold text-lg">Credit / Debit Card</span>
              </label>
              <label className="flex items-center p-4 border border-white/10 hover:border-white/30 rounded-xl cursor-pointer transition-colors">
                <input type="radio" name="payment" className="mr-4 accent-primary" />
                <Wallet className="mr-3" />
                <span className="font-semibold text-lg">Digital Wallet</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-pale mb-2">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-pale mb-2">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-pale mb-2">CVV</label>
                  <input type="text" placeholder="123" className="w-full bg-dark border border-white/10 rounded-lg p-3 text-white focus:border-secondary outline-none transition-colors" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-dark p-8 rounded-2xl sticky top-28 border border-white/10">
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h3>
            
            <div className="flex items-center space-x-4 mb-6">
              <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=150" className="w-16 h-16 rounded-lg object-cover" alt="event" />
              <div>
                <h4 className="font-bold">The Weekend Stadium Tour</h4>
                <p className="text-sm text-pale">2x VIP Tickets</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Tickets (2 x $300)</span>
                <span>$600.00</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Fee</span>
                <span>$25.00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>$45.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-8">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-secondary">$670.00</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-pale mb-6 justify-center">
              <Lock size={14} />
              <span>Payments are secure and encrypted</span>
            </div>

            <Link to="/success" className="block w-full py-4 text-center bg-primary hover:bg-red-800 text-white font-bold rounded-full transition-colors shadow-lg flex justify-center items-center">
              Pay $670.00 <Ticket className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
