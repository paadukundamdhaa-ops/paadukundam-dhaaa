import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Ticket, ShieldCheck, QrCode, Shield, Zap, Headphones, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle, user } = useAuth();
  
  // If user is already logged in, redirect them to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row font-sans relative bg-black">
      
      {/* Back to Website Button */}
      <Link 
        to="/" 
        className="absolute top-6 right-6 lg:top-10 lg:right-12 z-50 flex items-center gap-2 text-white/90 hover:text-white lg:text-gray-500 lg:hover:text-gray-900 transition-colors font-semibold text-sm bg-black/40 lg:bg-transparent px-4 py-2 lg:px-0 lg:py-0 rounded-full backdrop-blur-md lg:backdrop-blur-none border border-white/10 lg:border-none hover:scale-105 lg:hover:scale-100"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Website</span>
        <span className="sm:hidden">Back</span>
      </Link>

      {/* --- DESKTOP BACKGROUND LAYERS --- */}
      <div className="hidden lg:block absolute inset-0 w-[55%] z-0">
        <img src="/images/sunburn.png" alt="Concert" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>
      <div className="hidden lg:block absolute -top-[10%] -bottom-[10%] left-[45%] right-[-10%] bg-[#f8f9fa] border-l-[32px] border-[#8c1c24] transform -skew-x-[8deg] z-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"></div>

      {/* --- MOBILE BACKGROUND LAYER --- */}
      <div className="lg:hidden absolute inset-0 z-0 h-[55vh]">
        <img src="/images/sunburn.png" alt="Concert" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black"></div>
      </div>

      {/* --- CONTENT LAYERS --- */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
        
        {/* --- DESKTOP LEFT PANEL --- */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 xl:p-16">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-12">
              <img src="/images/LOGO __ Option 01.png" alt="Paadukundam Dhaa Logo" className="h-12" />
            </Link>

            <h1 className="text-5xl xl:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              The Stage <br/>
              <span className="text-[#facc15]">Awaits You!</span>
            </h1>
            <div className="w-16 h-1 bg-[#facc15] mb-6"></div>
            
            <p className="text-gray-300 text-lg mb-10 max-w-sm font-medium leading-relaxed">
              Log in to explore unforgettable concerts, book your tickets and experience live like never before.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <Ticket className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Exclusive Events</h3>
                  <p className="text-gray-400 text-sm">Access limited & exclusive live shows.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">Secure Booking</h3>
                  <p className="text-gray-400 text-sm">100% safe & secure ticket booking.</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-full border border-[#facc15]/30 flex items-center justify-center shrink-0">
                  <QrCode className="text-[#facc15]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 text-lg">QR Ticket Entry</h3>
                  <p className="text-gray-400 text-sm">Hassle-free entry with digital tickets.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400 text-sm mt-12">
            <Shield size={18} />
            <span>Your data is safe with us. We never share your information.</span>
          </div>
        </div>

        {/* --- MOBILE HEADER (Logo & Welcome Text) --- */}
        <div className="lg:hidden px-6 pt-10 pb-4 relative z-10">
          <div className="flex justify-between items-start mb-10">
             <Link to="/" className="flex items-center gap-2">
                <img src="/images/LOGO __ Option 01.png" alt="Paadukundam Dhaa Logo" className="h-8" />
             </Link>
             <div className="flex items-center gap-1 text-gray-300 text-xs border border-white/20 rounded-full px-3 py-1 bg-black/40 backdrop-blur-sm cursor-pointer">
                <span>🌐</span> English <span className="ml-1 text-[10px]">▼</span>
             </div>
          </div>

          <div className="flex justify-between items-start relative mt-4">
             <div className="w-[65%]">
               <h1 className="text-4xl font-black text-white leading-tight">Welcome <span className="text-[#facc15]">Back!</span></h1>
               <p className="text-gray-300 text-[13px] mt-3 font-medium leading-relaxed">Log in to continue your<br/>musical journey</p>
             </div>
             
             {/* Mobile Ticket Graphic */}
             <div className="absolute right-[-10px] top-[-20px] transform -rotate-[12deg] z-20">
                 <div className="px-5 py-4 bg-[#6b151b] rounded-xl shadow-2xl flex flex-col items-center justify-center border-dashed border border-white/20 relative">
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full"></div>
                    <div className="flex items-center gap-1.5 mb-2 opacity-80">
                       <span className="text-[#facc15] text-[10px]">★</span>
                       <span className="text-[#facc15] text-[8px]">★</span>
                       <span className="text-[#facc15] text-[10px]">★</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-end space-x-[1px] h-4">
                        <div className="w-1.5 bg-[#8c1c24] h-2"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-3.5"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-4"></div>
                        <div className="w-1.5 bg-[#8c1c24] h-2.5"></div>
                      </div>
                    </div>
                    <span className="text-white font-black text-[10px] tracking-widest uppercase mt-1">PAADUKUNDAM</span>
                 </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (Form Container) --- */}
        <div className="w-full lg:w-[55%] flex flex-col px-5 pb-8 lg:pt-6 lg:pb-6 lg:px-6 sm:px-12 items-center justify-center flex-1 z-10">
          
          {/* Main Card */}
          <div className="w-full max-w-[420px] bg-[#120a0b] lg:bg-white rounded-[24px] lg:rounded-[30px] p-6 sm:p-8 border border-[#2a1618] lg:border-gray-50 shadow-2xl lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] mb-4 lg:mb-8 relative z-10 mt-6 lg:mt-0">
            
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden lg:block text-center mb-5">
              <div className="inline-flex justify-center mb-4">
                 <img src="/images/LOGO __ Option 01.png" alt="Paadukundam Dhaa Logo" className="h-12" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Welcome <span className="text-[#8c1c24]">Back!</span>
              </h2>
              <p className="text-gray-500 text-xs font-medium">Log in to your account and continue your musical journey.</p>
            </div>

            <button onClick={signInWithGoogle} className="w-full bg-white text-gray-900 border border-gray-200 py-3 rounded-xl font-bold text-sm lg:text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-5 lg:mb-4 mt-5 lg:mt-4">
              <div className="h-[1px] bg-[#2a1618] lg:bg-gray-200 flex-1"></div>
              <span className="text-gray-500 lg:text-gray-400 text-[10px] font-bold uppercase tracking-widest">OR</span>
              <div className="h-[1px] bg-[#2a1618] lg:bg-gray-200 flex-1"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type="email" 
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-4 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Email address" 
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 lg:pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 lg:text-gray-400" />
                </div>
                <input 
                  type="password" 
                  className="w-full bg-transparent lg:bg-white border border-[#2a1618] lg:border-gray-200 rounded-xl py-3 lg:py-2.5 pl-11 pr-10 text-white lg:text-gray-900 font-medium text-[14px] lg:text-sm focus:border-[#8c1c24] focus:ring-1 focus:ring-[#8c1c24] outline-none transition-all placeholder:text-gray-600 lg:placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Password" 
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 lg:pr-3.5 flex items-center text-gray-500 lg:text-gray-400 hover:text-gray-300 lg:hover:text-gray-600">
                  <EyeOff size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 lg:pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 lg:w-3.5 lg:h-3.5 rounded border-[#2a1618] lg:border-gray-300 bg-transparent lg:bg-white text-[#8c1c24] focus:ring-[#8c1c24] accent-[#8c1c24]" />
                  <span className="text-[13px] lg:text-[13px] font-medium text-gray-400 lg:text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-[13px] lg:text-[13px] font-bold text-[#facc15] lg:text-[#8c1c24] hover:text-[#eab308] lg:hover:text-[#6b151b] transition-colors">Forgot Password?</a>
              </div>

              <div className="pt-3 lg:pt-2">
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#8c1c24] hover:bg-[#6b151b] text-white font-bold py-3.5 lg:py-2.5 text-[15px] lg:text-sm rounded-xl transition-all shadow-md">
                  Log In <ArrowRight size={18} />
                </button>
              </div>
            </form>

            <div className="mt-6 lg:mt-5 text-center text-[13px] font-medium text-gray-500 lg:text-gray-600">
              Don't have an account? <Link to="/register" className="text-[#facc15] lg:text-[#8c1c24] font-bold hover:underline transition-all ml-1">Sign Up</Link>
            </div>

            {/* --- MOBILE BOTTOM BADGES (Inside Card) --- */}
            <div className="lg:hidden mt-8 pt-6 border-t border-[#2a1618] grid grid-cols-4 gap-2">
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <ShieldCheck size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Secure</div>
                     <div className="text-[8px] text-gray-500">Payments</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Zap size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Instant</div>
                     <div className="text-[8px] text-gray-500">Confirmation</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Ticket size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">Easy</div>
                     <div className="text-[8px] text-gray-500">Booking</div>
                  </div>
               </div>
               <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-full border border-[#facc15]/20 flex items-center justify-center bg-[#facc15]/5">
                     <Headphones size={14} className="text-[#facc15]" />
                  </div>
                  <div className="leading-none">
                     <div className="text-[9px] text-white font-bold tracking-wide mb-0.5">24/7</div>
                     <div className="text-[8px] text-gray-500">Support</div>
                  </div>
               </div>
            </div>
          </div>

          {/* --- DESKTOP BOTTOM BADGES (Outside Card) --- */}
          <div className="hidden lg:grid w-full max-w-[600px] grid-cols-4 gap-4 mt-auto opacity-80">
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Lock className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Secure</span>
                <span className="text-[10px] text-gray-500">Payments</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Zap className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Instant</span>
                <span className="text-[10px] text-gray-500">Confirmation</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Ticket className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Easy</span>
                <span className="text-[10px] text-gray-500">Booking</span>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <div className="w-10 h-10 rounded-full border border-[#8c1c24]/20 flex items-center justify-center shrink-0">
                <Headphones className="text-[#8c1c24]" size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">24/7</span>
                <span className="text-[10px] text-gray-500">Support</span>
              </div>
            </div>
          </div>

          {/* --- MOBILE SAFE TEXT (Outside Card) --- */}
          <div className="lg:hidden flex items-center gap-2 text-gray-400 text-[11px] mt-4 mb-2 justify-center w-full font-medium">
             <ShieldCheck size={14} className="text-[#facc15]" />
             <span>Your data is safe with us. We never share your information.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
